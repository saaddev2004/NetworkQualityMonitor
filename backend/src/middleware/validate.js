import { z } from 'zod';
import net from 'net';

// ---------- helpers ----------

// Hostname: dot-separated labels, each starting/ending with a letter or digit.
// Because labels cannot start with "-", values like "-c" or "--help" are rejected
// (this blocks argument injection into the ping command).
const HOSTNAME_RE = /^(?=.{1,253}$)[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const isValidHost = (value) => net.isIP(value) !== 0 || HOSTNAME_RE.test(value);

const HAS_SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//;

// For HTTP targets a missing scheme is added ("example.com" -> "https://example.com").
export const normalizeAddress = (checkMethod, address) => {
    if (checkMethod === 'http' && !HAS_SCHEME_RE.test(address)) {
        return `https://${address}`;
    }
    return address;
};

export const sendValidationError = (res, error) => {
    return res.status(422).json({
        error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: error.issues.map(({ path, message }) => ({ path, message }))
        }
    });
};

// ---------- target schema ----------

const fields = {
    name: z.string().trim().min(1, 'Name is required').max(100),
    targetType: z.enum(['website', 'http_service', 'host']),
    address: z.string().trim().min(1, 'Address is required').max(2048),
    checkMethod: z.enum(['http', 'icmp']),
    checkIntervalSeconds: z.number().int().min(1).max(86400),
    warningThresholdMs: z.number().int().min(1).max(600000),
    criticalThresholdMs: z.number().int().min(1).max(600000),
    timeoutSeconds: z.number().int().min(1).max(120)
};

// Full schema: used for POST and for the merged result of PATCH.
export const targetSchema = z.object({
    ...fields,
    checkIntervalSeconds: fields.checkIntervalSeconds.default(60),
    warningThresholdMs: fields.warningThresholdMs.default(500),
    criticalThresholdMs: fields.criticalThresholdMs.default(1000),
    timeoutSeconds: fields.timeoutSeconds.default(5)
}).superRefine((data, ctx) => {
    if (data.warningThresholdMs >= data.criticalThresholdMs) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Warning threshold must be less than critical threshold',
            path: ['warningThresholdMs']
        });
    }

    const address = normalizeAddress(data.checkMethod, data.address);

    if (data.checkMethod === 'http') {
        let url;
        try {
            url = new URL(address);
        } catch {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Address must be a valid URL', path: ['address'] });
            return;
        }
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Only http:// and https:// URLs are allowed', path: ['address'] });
        } else if (url.username || url.password) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Credentials in the URL are not allowed', path: ['address'] });
        }
    } else if (!isValidHost(address)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'ICMP address must be a hostname or IP address (no scheme, port or path)',
            path: ['address']
        });
    }
}).transform((data) => ({
    ...data,
    address: normalizeAddress(data.checkMethod, data.address)
}));

// Partial schema: used for PATCH body (only the fields being changed).
export const partialTargetSchema = z.object(fields)
    .partial()
    .strict()
    .refine((data) => Object.keys(data).length > 0, { message: 'At least one field is required' });

// Converts a DB row to the camelCase shape of targetSchema, applies the patch,
// and validates the MERGED result (so cross-field rules still hold on a partial edit).
export const validateMergedTarget = (row, patch) => {
    const current = {
        name: row.name,
        targetType: row.target_type,
        address: row.address,
        checkMethod: row.check_method,
        checkIntervalSeconds: row.check_interval_seconds,
        warningThresholdMs: row.warning_threshold_ms,
        criticalThresholdMs: row.critical_threshold_ms,
        timeoutSeconds: row.timeout_seconds
    };
    return targetSchema.safeParse({ ...current, ...patch });
};

// ---------- middleware ----------

export const validateTarget = (req, res, next) => {
    const parsed = targetSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error);
    req.body = parsed.data;
    next();
};

export const validateTargetUpdate = (req, res, next) => {
    const parsed = partialTargetSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error);
    req.body = parsed.data;
    next();
};

const enabledSchema = z.object({ isEnabled: z.boolean({ required_error: 'isEnabled is required', invalid_type_error: 'isEnabled must be true or false' }) });

export const validateEnabledToggle = (req, res, next) => {
    const parsed = enabledSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error);
    req.body = parsed.data;
    next();
};

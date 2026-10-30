import { z } from 'zod';

export const targetSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    targetType: z.enum(['website', 'http_service', 'host']),
    address: z.string().min(1, "Address is required"),
    checkMethod: z.enum(['http', 'icmp']),
    checkIntervalSeconds: z.number().min(1).default(60),
    warningThresholdMs: z.number().min(1).default(500),
    criticalThresholdMs: z.number().min(1).default(1000),
    timeoutSeconds: z.number().min(1).default(5)
}).refine(data => data.warningThresholdMs < data.criticalThresholdMs, {
    message: "Warning threshold must be less than critical threshold",
    path: ["warningThresholdMs"]
});

export const validateTarget = (req, res, next) => {
    try {
        req.body = targetSchema.parse(req.body);
        next();
    } catch (error) {
        res.status(422).json({
            error: { 
                code: 'VALIDATION_ERROR', 
                message: 'Invalid input', 
                details: error.errors 
            }
        });
    }
};
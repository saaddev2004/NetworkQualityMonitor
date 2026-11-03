// Characters that make Excel / Google Sheets treat a cell as a formula.
const FORMULA_STARTERS = ['=', '+', '-', '@', '\t', '\r'];

export const csvCell = (value) => {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();

    let str = String(value);

    // Formula-injection protection for EVERY text cell (name, address, error messages ...).
    // Real numbers are not touched, so negative numbers stay valid.
    if (typeof value === 'string' && str.length > 0 && FORMULA_STARTERS.includes(str[0])) {
        str = `'${str}`;
    }

    str = str.replace(/"/g, '""');
    return /[",\r\n]/.test(str) ? `"${str}"` : str;
};

// rows: array of objects, columns: ordered list of keys.
// The header is always written, even when there are no rows.
export const toCsv = (rows, columns) => {
    const lines = [columns.join(',')];
    for (const row of rows) {
        lines.push(columns.map((col) => csvCell(row[col])).join(','));
    }
    return lines.join('\n');
};

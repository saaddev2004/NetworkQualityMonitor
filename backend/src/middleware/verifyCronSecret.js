
const verifyCronSecret = (req, res, next) => {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;

    if (!cronSecret) {
        return res.status(500).json({
            error: 'Cron authentication is not configured'
        });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({
            error: 'Unauthorized'
        });
    }

    next();
};

export default verifyCronSecret;

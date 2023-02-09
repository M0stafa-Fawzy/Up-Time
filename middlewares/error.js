exports.errorHandler = async (err, req, res, next) => {
    if (err) {
        console.log(err);
        if (err.code == 11000) return res.status(409).json({ error: `this ${Object.keys(err?.keyValue)[0]} is already registered` });
        return res.status(err?.status || err?.errors[Object.keys(err.errors)[0]]?.reason?.status || 500).json({ error: err?.message });
    }
}

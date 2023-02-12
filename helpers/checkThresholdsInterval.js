const Check = require("../models/check.model")
const { thresholdMail } = require("./email")

exports.thresholdsInterval = () => {
    setInterval(async () => {
        const checks = await Check.find({}).populate("owner", "email")
        checks.forEach(check => {
            if (check?.threshold >= 1) {
                thresholdMail(check?.owner?.email, check?.url, check?.threshold)
            }
        })
    }, 1000)
}
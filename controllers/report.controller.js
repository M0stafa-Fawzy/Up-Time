const axios = require("axios")
const Check = require('../models/check.model')
const { CustomError } = require('../utils/errors');
const { asyncHandler } = require("../utils/asyncHandler")

const generateReport = asyncHandler(async (req, res, next) => {
    const { id } = req
    // checkID => check to get desired data for. 
    const { checkID } = req.params
    if (!checkID) throw new CustomError("check id is not provided", 400)

    const check = await Check.findOne({ _id: checkID, owner: id })
    if (!check) throw new CustomError("we can not generate a report for check that does not exist or does not belong to you", 404)

    axios.get(check.url).then((re) => {
        const report = {
            status: re.status == 200 ? 'Up' : 'Down',
            availability: (check.upTime / parseInt(check.createdAt)) / 100,
            outages: check.outage.length,
            downtime: check.downTime,
            uptime: check.upTime,
            responseTime: (check.responseTime.reduce((a, b) => a + b)) / check.responseTime.length,
            history: check.history
        }
        return res.status(200).json({ report })
    }).catch(e => {
        const report = {
            status: e.status == 200 ? 'Up' : 'Down',
            availability: (check.upTime / parseInt(check.createdAt)) / 100,
            outages: check.outage.length,
            downtime: check.downTime,
            uptime: check.upTime,
            responseTime: (check.responseTime.reduce((a, b) => a + b)) / check.responseTime.length,
            history: check.history
        }
        return res.status(200).json({ report })
    })

})

const generateReportByTagName = asyncHandler(async (req, res, next) => {
    const { tagName } = req.query
    if (!tagName) throw new CustomError("tag name not provided", 400)



})

module.exports = {
    generateReport,
    generateReportByTagName
}
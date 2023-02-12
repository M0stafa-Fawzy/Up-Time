const axios = require("axios")
const Check = require('../models/check.model')
const { CustomError } = require('../utils/errors');
const { asyncHandler } = require("../utils/asyncHandler")

const generateReport = asyncHandler(async (req, res, next) => {
    // checkID => check to get desired data for. 
    const { checkID } = req.params
    if (!checkID) throw new CustomError("check id is not provided", 400)
    const { id } = req

    const check = await Check.findOne({ _id: checkID, owner: id })
    if (!check) throw new CustomError("we can not generate a report for check that does not exist or does not belong to you", 404)

    const { data } = await axios.get(check.url)
    let report = {
        status: data.status == 200 ? 'Up' : 'Down',
        availability: `${((check.upTime / (new Date().getTime() - new Date(check.createdAt).getTime())) * 100).toFixed(2)} %`,
        outages: check.outage?.length,
        downtime: `${(check.downTime != 0 ? check.downTime / 1000 : 0)} seconds`,
        uptime: `${(check.upTime != 0 ? check.upTime / 1000 : 0)} seconds`,
        responseTime: `${(check.responseTime?.reduce((a, b) => a + b) / check.responseTime?.length).toFixed(2)} ms`,
        history: check.history
    }
    return res.status(200).json({ report })
})

const generateReportByTagName = asyncHandler(async (req, res, next) => {
    const { tagName } = req.query
    if (!tagName) throw new CustomError("tag name not provided", 400)






})

module.exports = {
    generateReport,
    generateReportByTagName
}
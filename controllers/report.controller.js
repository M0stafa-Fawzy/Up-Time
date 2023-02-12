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

    axios.get(check.url).then(response => {
        let report = {
            status: 'Up',
            availability: `${(((new Date() - new Date(check.upTime)) / new Date(check.createdAt)) * 100).toFixed(2)} %`,
            outages: check.outage?.length,
            downtime: `${(check.downTime != 0 ? check.downTime / 1000 : 0)} seconds`,
            uptime: `${(check.upTime != 0 ? check.upTime / 1000 : 0)} seconds`,
            responseTime: `${(check.responseTime?.reduce((a, b) => a + b) / check.responseTime?.length).toFixed(2)} ms`,
            history: check.history
        }
        return res.status(200).json({ report })
    }).catch(error => {
        let report = {
            status: 'Down',
            availability: `${(((new Date() - new Date(check.upTime)) / new Date(check.createdAt)) * 100).toFixed(2)} %`,
            outages: check.outage?.length,
            downtime: `${(check.downTime != 0 ? check.downTime / 1000 : 0)} seconds`,
            uptime: `${(check.upTime != 0 ? check.upTime / 1000 : 0)} seconds`,
            responseTime: `${(check.responseTime?.reduce((a, b) => a + b) / check.responseTime?.length).toFixed(2)} ms`,
            history: check.history
        }
        return res.status(200).json({ report })
    })
})

const generateReportByTagName = asyncHandler(async (req, res, next) => {
    const { tagName } = req.query
    if (!tagName) throw new CustomError("tag name not provided", 400)

    let reports = []
    const agg = [
        {
            $unwind: {
                path: "$tags"
            }
        },
        {
            $match: {
                tags: tagName
            }
        }
    ]

    let checks = await Check.aggregate(agg)
    for (let check of checks) {
        axios.get(check.url).then(response => {
            let report = {
                status: 'Up',
                availability: `${(((new Date() - new Date(check.upTime)) / new Date(check.createdAt)) * 100).toFixed(2)} %`,
                outages: check.outage?.length,
                downtime: `${(check.downTime != 0 ? check.downTime / 1000 : 0)} seconds`,
                uptime: `${(check.upTime != 0 ? check.upTime / 1000 : 0)} seconds`,
                responseTime: `${(check.responseTime?.reduce((a, b) => a + b) / check.responseTime?.length).toFixed(2)} ms`,
                history: check.history
            }
            reports.push({ report })
        }).catch(error => {
            let report = {
                status: 'Down',
                availability: `${(((new Date() - new Date(check.upTime)) / new Date(check.createdAt)) * 100).toFixed(2)} %`,
                outages: check.outage?.length,
                downtime: `${(check.downTime != 0 ? check.downTime / 1000 : 0)} seconds`,
                uptime: `${(check.upTime != 0 ? check.upTime / 1000 : 0)} seconds`,
                responseTime: `${(check.responseTime?.reduce((a, b) => a + b) / check.responseTime?.length).toFixed(2)} ms`,
                history: check.history
            }
            reports.push({ report })
        })
    }
    setTimeout(() => {
        return res.status(200).send({ reports })
    }, 2000)
})

module.exports = {
    generateReport,
    generateReportByTagName
}
const router = require('express').Router()
const { isAuthenticated, isVerified } = require("../middlewares/auth")
const {
    generateReport,
    generateReportByTagName
} = require("../controllers/report.controller")

router.use([isAuthenticated, isVerified])
router.get('/', generateReportByTagName)
router.get('/:checkID', generateReport)

module.exports = router
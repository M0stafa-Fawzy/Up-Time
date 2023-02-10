const router = require("express").Router()
const { isAuthenticated, isVerified } = require("../middlewares/auth")
const { validateRequest } = require("../middlewares/validate")
const { userValidator, verifyUserValidator } = require("../validators/user.validator")
const {
    signUp,
    login,
    getProfile,
    verifyEmail
} = require("../controllers/user.controller")

router.post('/', validateRequest(userValidator), signUp)
router.get('/me', isAuthenticated, isVerified, getProfile)
router.post('/login', validateRequest(userValidator), login)
router.post('/verify', validateRequest(verifyUserValidator), verifyEmail)

module.exports = router
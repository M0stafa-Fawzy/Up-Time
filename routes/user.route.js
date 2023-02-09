const router = require("express").Router()
const { isAuthenticated } = require("../middlewares/auth")
const { validateRequest } = require("../middlewares/validate")
const { userValidator } = require("../validators/user.validator")
const { uploadPhoto } = require("../middlewares/upload")
const {
    signUp,
    login,
    getProfile
} = require("../controllers/user.controller")

let type = uploadPhoto.single('Image');

router.route('/').post(validateRequest(userValidator), type, signUp)
router.get('/profile', isAuthenticated, isVerified, getProfile)
router.post('/login', validateRequest(userValidator), login)

module.exports = router
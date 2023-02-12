const axios = require("axios")
const https = require("https")
const Check = require('../models/check.model')
const { downMail, upMail } = require('../helpers/email');
const { CustomError } = require('../utils/errors');
const { asyncHandler } = require("../utils/asyncHandler")

const returnAgent = (ignoreSSL) => {
    return new https.Agent({
        rejectUnauthorized: ignoreSSL ? ignoreSSL : false
    });
}

const map = []
axios.interceptors.request.use(function (config) {
    config.metadata = { startTime: new Date() }
    return config;
}, function (error) {
    return Promise.reject(error);
});

axios.interceptors.response.use((response) => {
    response.config.metadata.endTime = new Date()
    response.duration = response.config.metadata.endTime - response.config.metadata.startTime
    return response;
}, (error) => {
    error.config.metadata.endTime = new Date();
    error.duration = error.config.metadata.endTime - error.config.metadata.startTime;
    return Promise.reject(error);
});

const createCheck = asyncHandler(async (req, res) => {
    await Check.deleteMany({})
    const { name, url, protocol, path, port, interval, threshold,
        authentication, httpHeaders, assert, tags, ignoreSSL } = req.body
    const { id } = req

    let uri = `${protocol ? protocol + '://' : 'https://'}${url}${port ? ':' + port : ""}${path ? path : ""}`
    let check = await Check.create({
        name, url: uri, protocol, path, port, interval, threshold,
        authentication, httpHeaders, assert, tags, ignoreSSL, owner: id
    })
    if (!check) throw new CustomError("check creation failed", 500)

    const intervalID = setInterval(async () => {
        let headers = httpHeaders ? { ...httpHeaders } : { ...authentication }
        axios.get(uri, { headers }, { httpsAgent: returnAgent(ignoreSSL) })
            .then(async (res) => {
                console.log(res.duration);
                let ch = await Check.findById(check._id).populate("owner", "username email")
                if (res?.status != ch?.lastStatus) upMail(ch?.owner?.email, ch?.name, ch?.url, new Date())
                ch.lastStatus = res?.status
                ch.upTime = ch?.upTime + (+interval * 60 * 1000)
                ch.history?.push(new Date())
                ch.responseTime?.push(res.duration)
                await ch.save()
            })
            .catch(async (e) => {
                let ch = await Check.findById(check._id).populate("owner", "username email")
                if (e?.status != ch?.lastStatus) downMail(ch?.owner?.email, ch?.name, ch?.url, new Date())
                ch.lastStatus = e?.status
                ch.downTime = ch?.downTime + (+interval * 60 * 1000)
                ch.outage?.push(new Date())
                ch.history?.push(new Date())
                ch.responseTime?.push(e.duration)
                ch.threshold++
                await ch.save()
            })
    }, +interval * 60 * 1000)

    map.push({ id: check._id, intervalID })
    return res.status(200).json({ check })
})

const deleteCheck = asyncHandler(async (req, res) => {
    const { id } = req
    const { checkID } = req.params
    if (!checkID) throw new CustomError("check id is not provided", 400)

    const check = await Check.findByIdAndDelete({ _id: checkID, owner: id })
    if (!check) throw new CustomError("check not found or it does not belong to you", 404)

    clearInterval(map.filter(ob => ob.id == checkID)[0].intervalID)
    return res.status(200).json({ message: "check deleted successfully", check })
})

const updateCheck = asyncHandler(async (req, res) => {
    const { id } = req
    const { checkID } = req.params
    if (!checkID) throw new CustomError("check id is not provided", 400)

    const { name, url, protocol, path, port, interval, threshold,
        authentication, httpHeaders, assert, tags, ignoreSSL } = req.body
    clearInterval(map.filter(ob => ob.id == checkID)[0].intervalID)

    const check = await Check.findOneAndUpdate(
        { _id: checkID, owner: id },
        {
            name, url, protocol, path, port, interval, threshold,
            authentication, httpHeaders, assert, tags, ignoreSSL
        },
        { new: true, runValidators: true }
    )
    if (!check) throw new CustomError("updating check failed", 500)

    let uri = `${protocol ? protocol + '://' : check.protocol}${url}${port ? ':' + port : check.port}${path ? path : check.path}`
    const intervalID = setInterval(async () => {
        let headers = httpHeaders ? { ...httpHeaders } : { ...authentication }
        axios.get(uri, { headers }, { httpsAgent: returnAgent(ignoreSSL) })
            .then(async (res) => {
                let ch = await Check.findById(check._id).populate("owner", "username email")
                if (res?.status != ch?.lastStatus) upMail(ch?.owner?.email, ch?.name, ch?.url, new Date())
                ch.lastStatus = res?.status
                ch.upTime = ch?.upTime + (+interval * 60 * 1000)
                ch.history?.push(new Date())
                ch.responseTime?.push(res.duration)
                await ch.save()
            })
            .catch(async (e) => {
                let ch = await Check.findById(check._id).populate("owner", "username email")
                if (e?.status != ch?.lastStatus) downMail(ch?.owner?.email, ch?.name, ch?.url, new Date())
                ch.lastStatus = e?.status
                ch.downTime = ch?.downTime + (+interval * 60 * 1000)
                ch.outage?.push(new Date())
                ch.history?.push(new Date())
                ch.responseTime?.push(e.duration)
                ch.threshold++
                await ch.save()
            })
    }, +interval * 60 * 1000)

    map.push({ id: check._id, intervalID })
    return res.status(200).json({ check })
})

const getCheck = asyncHandler(async (req, res) => {
    const { id } = req
    const { checkID } = req.params
    if (!checkID) throw new CustomError("check id is not provided", 400)

    const check = await Check.findOne({ _id: checkID, owner: id });
    if (!check) throw new CustomError("check not forund", 404)

    return res.status(200).json({ check });
})

module.exports = {
    createCheck,
    deleteCheck,
    updateCheck,
    getCheck
}
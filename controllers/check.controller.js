const axios = require("axios")
const Check = require('../models/check.model')
const { downMail, upMail } = require('../helpers/email');
const { CustomError } = require('../utils/errors');
const { asyncHandler } = require("../utils/asyncHandler")

const map = []
axios.interceptors.request.use(function (config) {
    config.metadata = { startTime: new Date() }
    return config;
}, function (error) {
    return Promise.reject(error);
});

let uptime = 0, downtime = 0
axios.interceptors.response.use((response) => {
    response.config.metadata.endTime = new Date()
    response.duration = response.config.metadata.endTime - response.config.metadata.startTime
    uptime += response.duration
    response.uptime = uptime
    return response;
}, (error) => {
    error.config.metadata.endTime = new Date();
    error.duration = error.config.metadata.endTime - error.config.metadata.startTime;
    downtime += error.duration
    error.downtime = downtime
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
        axios.get(uri, { headers })
            .then(async (res) => {
                console.log(res.duration, res.uptime);
                let ch = await Check.findById(check._id)
                ch.upTime = res.uptime
                ch.history.push(new Date())
                ch.responseTime.push(res.duration)
                await ch.save()
            })
            .catch(async (e) => {
                console.log(e.duration, e.downtime);
                let ch = await Check.findById(check._id)
                ch.downTime = e.downtime
                ch.outage.push(new Date())
                ch.history.push(new Date())
                ch.responseTime.push(e.duration)
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
        axios.get(uri, { headers })
            .then(async (res) => {
                let ch = await Check.findById(check._id)
                ch.upTime = res.uptime
                ch.history.push(new Date())
                ch.responseTime.push(res.duration)
                await ch.save()
            })
            .catch(async (e) => {
                console.log(e.duration, e.downtime);
                let ch = await Check.findById(check._id)
                ch.downTime = e.downtime
                ch.outage.push(new Date())
                ch.history.push(new Date())
                ch.responseTime.push(e.duration)
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
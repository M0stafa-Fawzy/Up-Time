const Check = require('../models/check.model')
const { downMail, upMail } = require('../helpers/email');
const { CustomError } = require('../utils/errors');
const { asyncHandler } = require("../utils/asyncHandler")


const createCheck = asyncHandler(async (req, res) => {
    const { name, url, protocol, path, port, interval, threshold,
        authentication, ttpHeaders, assert, tags, ignoreSSL } = req.body
    const { id } = req

    const check = Check.create({
        url, interval, name, protocol,
        owner: _id
    })
    const monitor = ping(url, interval, name)

    monitor.on('up', async (response, state) => {
        // upMail(req.user.email, check.name)
        res.status(201).send(check)

        monitor.on('down', async (response) => {
            // downMail(req.user.email, check.name)
        })

        monitor.on('stop', () => {
            return res.status(400).send('monitor has stopped')
        })

        monitor.on('error', (err) => {
            return res.status(400).send(err)
        })
    })
})

const deleteCheck = asyncHandler(async (req, res) => {
    const check = await Check.findByIdAndDelete({ _id: req.params.id, owner: req.user._id })
    if (!check) {
        return res.status(404).send()
    }
    res.status(200).send(check)
})

const updateCheck = asyncHandler(async (req, res) => {
    const { name, url, protocol, path, port, interval, threshold,
        authentication, ttpHeaders, assert, tags, ignoreSSL } = req.body
    const { id } = req

    const check = await Check.findOne({ _id: req.params.id, owner: id })
    if (!check) {
        return res.status(404).send()
    }
    const keys = Object.keys(req.body)
    const allowsUpdates = ['name', 'protocol', 'url', 'path', 'webhook', 'timeout', 'interval', 'threshold', 'httpHeaders', 'tags', 'assert', 'ignoreSSL']
    const valid = keys.every((update) => allowsUpdates.includes(update))
    if (!valid) {
        return res.status(500).send({ error: 'invalid updates' })
    }
    try {
        keys.forEach((update) => {
            check[update] = req.body[update]
        })
        await check.save()
        res.status(200).send(check)
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
})

const getCheck = asyncHandler(async (req, res) => {
    const check = await Check.findOne({ _id: req.params.id, owner: id });
    if (!check) {
        return res.status(404).send();
    }

    const monitor = ping(check.url, check.interval);
    monitor.on('up', (response, state) => {
        if (state.isUp) {
            monitor.stop();
        }
    });
    res.status(200).send('paused');
})

module.exports = {
    createCheck,
    deleteCheck,
    updateCheck,
    getCheck
}
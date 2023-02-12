const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SEND_GRID_API)

const upMail = (email, name, url, recordedAt) => {
    sgMail.send({
        // put my mail just for test purpose
        from: 'mostafafawzy471@gmail.com',
        to: email,
        subject: 'Attention. Your Site is Up',
        text: `We Want to Notify You That Your Site With Check Title (${name}) and URL (${url}) is Now Up at ${recordedAt}`
    })
}

const downMail = (email, name, url, recordedAt) => {
    try {
        sgMail.send({
            // put my mail just for test purpose
            from: 'mostafafawzy471@gmail.com',
            to: email,
            subject: 'Attention. Your Site is Down',
            text: `We Want to Notify You That Your Check With Check Title (${name}) and URL (${url}) is Now Down at ${recordedAt}`
        })
    } catch (error) { }
}

const verificationMail = (name, email, otp) => {
    try {
        sgMail.send({
            // put my mail just for test purpose
            from: 'mostafafawzy471@gmail.com',
            to: email,
            subject: 'verification mail',
            text: `Hello ${name}. Your Verification Code is ${otp}.`
        })
    } catch (error) { }
}

const thresholdMail = (email, url, threshold) => {
    try {
        sgMail.send({
            // put my mail just for test purpose
            from: 'mostafafawzy471@gmail.com',
            to: email,
            subject: 'Attention. Your Site is Not Stable',
            text: `We Want to Notify You That Your URL (${url}) Has Been Found Down ${threshold} Times.`
        })
    } catch (error) { }

}

module.exports = {
    upMail,
    downMail,
    verificationMail,
    thresholdMail
}
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SEND_GRID_API)

const upMail = (email, name) => {
    sgMail.send({
        // put my mail just for test purpose
        from: 'mostafafawzy256@gmail.com',
        to: email,
        subject: 'your site is up',
        text: `we want to notify you that your site which check title is ${name} is now up`
    })
}


const downMail = (email, url) => {
    sgMail.send({
        // put my mail just for test purpose
        from: 'mostafafawzy256@gmail.com',
        to: email,
        subject: 'your site is down',
        text: `we want to notify you that your site which check title is ${name} is now down`
    })
}

const verificationMail = (name, email, verCode) => {
    sgMail.send({
        from: 'mostafafawzy256@gmail.com',
        to: email,
        subject: 'verification mail',
        text: `Hello ${name} your verification code is ${verCode}`
    })
}


module.exports = {
    upMail,
    downMail,
    verificationMail
}
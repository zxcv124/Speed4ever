const sgMail = require('@sendgrid/mail')

let isConfigured = false;

const getClient = () => {
    const apiKey = process.env.SENDGRID_API_KEY;

    if (!apiKey) {
        throw new Error('SENDGRID_API_KEY is required to send transactional email');
    }

    if (!isConfigured) {
        sgMail.setApiKey(apiKey);
        isConfigured = true;
    }

    return sgMail;
}

module.exports = {
    send: (...args) => getClient().send(...args)
};

const nodeMailer=require("nodemailer")

module.exports = async({email , subject , message}) =>{
    const transport = nodeMailer.createTransport({
        host:process.env.SMTP_HOST,
        service:process.env.SMTP_SERVICE,
        port:process.env.SMTP_PORT,
        auth:{
            user:process.env.SMTP_MAIL,
            pass:process.env.SMTP_PASSWORD,
        }
    })

    const option ={
        from:process.env.SMTP_MAIL,
        to:email,
        subject,
        html:message
    }

    await transport.sendMail(option)
}
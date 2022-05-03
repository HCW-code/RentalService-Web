const nodemailer = require('nodemailer');

module.exports = {
    sendmail: async function () {
        
        if(allow == 1) 
            text = "축하합니다. 회원가입이 승인되었습니다! 로그인을 시도하세요"
        else if(allow == 0)
            text = "죄송합니다. 회원가입이 거절되었습니다."
        else if(allow ==3)
            text = "신청하신 정보가 변경되었습니다."
        else if(allow ==2)
            text = "죄송합니다. 신청하신 정보변경이 거절되었습니다."

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'cstonefg@gmail.com',
                    pass: 'cstone123'
                }
            });

            // send mail with defined transport object
            let info = await transporter.sendMail(
                {
                    from: `"스키보드 렌탈 플랫폼" <'cstonefg@gmail.com'>`,
                    to: toEmail,
                    subject: '스키보드 렌탈 플랫폼에서 보냄',
                    text: text,
                    html: `<b>${text}</b>`
                    }
            );

        }
    };
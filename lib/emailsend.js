const nodemailer = require("nodemailer");

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
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "cstonefg@gmail.com",
        pass: "fjhaofyosyhuozgc",
      }
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: `"스키보드 렌탈 플랫폼" <'cstonefg@gmail.com'>`,
      to: toEmail,
      subject: "스키보드 렌탈 플랫폼에서 보냄",
      text: text,
      html: `<b>${text}</b>`,
    });
  },

  findaccount_sendmail: async function () {
    let authNum = Math.random().toString().substring(2, 8);
    let text = "아래의 인증 번호를 입력하여 인증을 완료해주세요.";

    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "cstonefg@gmail.com",
        pass: "fjhaofyosyhuozgc",
      },
    });

    // send mail with defined transport object
    let mailOptions = await transporter.sendMail({
      from: `"스키보드 렌탈 플랫폼" <'cstonefg@gmail.com'>`,
      to: toEmail,
      subject: "아이디ㆍ비밀번호 찾기를 위한 인증번호를 입력해주세요.",
      text: text,
      html: `<p style='color:black'><b>${text}</b></p>
             <h2>${authNum}</h2>`,
    });

    /*transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
        console.log("Finish sending email : " + info.response);
        transporter.close()
    });*/
    return authNum;
  },

  //진행중
  findaccount_sendmail_passwd : async function (pass) {
    console.log(toEmail)
    console.log(pass)    
    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "cstonefg@gmail.com",
        pass: "fjhaofyosyhuozgc",
      },
    });

    // send mail with defined transport object
    let mailOptions = await transporter.sendMail({
      from: `"스키보드 렌탈 플랫폼" <'cstonefg@gmail.com'>`,
      to: toEmail,
      subject: "스키보드 렌탈 플랫폼 비밀번호 초기화",
      html: `<p style='color:black'><b>초기화된 비밀번호는 ${pass} 입니다</b></p>`,
    });
    
  },
};

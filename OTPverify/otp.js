

require('dotenv').config()

const serviceSID = process.env.serviceSID
const accountSID = process.env.accountSID
const authToken = process.env.authToken
let SID
const client = require('twilio')(accountSID, authToken);
module.exports.otpCall = (phone) => {
  client.verify.v2.services.create({ friendlyName: 'Electronics Mart OTP verification' })
    .then(service => {
      SID = service.sid
      client.verify.v2.services(service.sid)
        .verifications
        .create({ to: '+91' + phone, channel: 'sms' })
        .then(verification => console.log(verification.status))
    }
    )
},

  module.exports.otpVerify = async (phone, otp) => {
    let validation
    await client.verify.v2.services(SID)
      .verificationChecks
      .create({ to: '+91' + phone, code: otp })
      .then((verification_check) => {
        console.log(verification_check)
        validation = verification_check
      });
    return validation
  }
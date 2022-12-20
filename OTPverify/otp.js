
require('dotenv').config()



const serviceSID = process.env.serviceSID
const accountSID = process.env.accountSID
const authToken = process.env.authToken
module.exports.otpCall = (phone) => {
  const client = require('twilio')( accountSID, authToken);
  client.verify.v2
    .services(serviceSID)
    .verifications.create({ to: `+91${phone}`, channel: "sms" });

},

  module.exports.otpVerify = async (phone, otp) => {
    const client = require('twilio')( accountSID, authToken);
    return new Promise((resolve, reject) => {
      client.verify.v2
        .services(serviceSID )
        .verificationChecks.create({ to: `+91${phone}`, code: otp })
        .then((verification_check) => {
          resolve(verification_check);
        });
    });

  }
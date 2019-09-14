const functions = require("firebase-functions");
const twilio = require("twilio");
const messagebird = require("messagebird")("gdOLCcZvia3OaD1wHcWcmR33X");
// const accountSid = functions.config().twilio.accountsid;
// const authToken = functions.config().twilio.authtoken;
// const twilioClient = twilio(accountSid, authToken);
const FROM_NUMBER = "+61480021420";

const { getCollection, getMessages } = require("./database");

const sendTwilioMessage = params => {
  return new Promise((resolve, reject) => {
    return messagebird.messages.create(params, function(err, response) {
      if (err) {
        console.log(err);
        return null;
      }
      console.log(response);
      resolve();
      return null;
    });
  });
};

const dispatchSMS = () => {
  return getCollection("messages")
    .where("sent", "==", false)
    .get()
    .then(querySnapshot => {
      if (querySnapshot.empty) {
        console.log("No matching documents.");
        return null
      }
      let promises = [];
      querySnapshot
        .forEach(sms => {
          const messageId = sms.id;
          const params = {
            originator: "+61481187062",
            recipients: ["+61481187062"],
            body: sms.data().smsBody
          };
          console.log(messageId);
          promises.push(
          sendTwilioMessage(params).then(() =>
            getMessages(messageId).update({ sent: true })
          ))
        })
          return  Promise.all(promises)
    });
};

module.exports = {
  dispatchSMS: dispatchSMS
};

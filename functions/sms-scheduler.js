const functions = require("firebase-functions");
const twilio = require("twilio");
const messagebird = require('messagebird')('m1p6kxzxfpp8T3OC9PkaiVBth');
const accountSid = functions.config().twilio.accountsid;
const authToken = functions.config().twilio.authtoken;
const twilioClient = twilio(accountSid, authToken);
const FROM_NUMBER = "+61480021420";

const { getCollection, getMessages } = require("./database");

const sendTwilioMessage = smsBody => {
  return messagebird.messages.create(smsBody).catch(err => console.log(err));
};

const dispatchSMS = () => {
  getCollection("messages")
    .where("sent", "==", false)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        console.log("No matching documents.");
        return;
      }
      let promises = [];
      snapshot.forEach(sms => {
        const messageId = sms.id;
        const smsBody = {
          body: sms.data().smsBody,
          originator: '+61481187062', // testing: +15005550006,
          recipients: [
            "+61" + sms.data().phone_num
          ]
        };
        promises.push(
          sendTwilioMessage(smsBody).then(() =>
            getMessages(messageId).update({ sent: true })
          )
        );
      });
      return Promise.all(promises);
    });
};

module.exports = {
  dispatchSMS: dispatchSMS
};

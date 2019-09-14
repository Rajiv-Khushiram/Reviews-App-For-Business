const functions = require("firebase-functions");

const accountSid = functions.config().twilio.accountsid;
const authToken = functions.config().twilio.authtoken;
const twilioClient = twilio(accountSid, authToken);

const {
    getCollection,
    getMessages
  } = require("./database");

const sendTwilioMessage = smsBody => {
  return twilioClient.messages.create(smsBody).catch(err => console.log(err));
};

const sendMessages = () => {
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
          from: FROM_NUMBER, // testing: +15005550006,
          to: "+61" + sms.data().phone_num
        };
        promises.push(
          sendTwilioMessage(smsBody).then(() =>
            getMessages(messageId).update({ sent: true })
          )
        );
      });
      Promise.all(promises);
    });
};

module.exports = {
    sendMessages: sendMessages,
  }
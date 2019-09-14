const functions = require("firebase-functions");
const admin = require("firebase-admin");
const request = require("request-promise");
const algoliasearch = require("algoliasearch");
const twilio = require("twilio");
const express = require("express");
const cors = require("cors");

const handleShortUrlRequest = require("./handle-short-url-request");
const internalMetrics = require("./api/internal-metrics");
const sendMessages = require("./sms-scheduler")

const {
  createBusinessShortUrl,
  createPhotoShortUrl
} = require("./create-short-url");
const {
  getCollection,
  getDocument,
  getBusinesses,
  getCustomers,
  getPurchases,
  getPhotos,
  getMessages
} = require("./database");
const {
  updateCollectionsBusinessURL,
  updateCollectionsforPhotoURL
} = require("./handle-url-update-for-collections");

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;
const ALGOLIA_SEARCH_KEY = functions.config().algolia.search_key;

const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
const api = express();

const ALGOLIA_INDEX_PURCHASES = "purchases";
const ALGOLIA_INDEX_CUSTOMERS = "customers";
const DOMAINURL = "https://autoreviews.web.app";
const FROM_NUMBER = "+61480021420";

admin.initializeApp(functions.config().firebase);

api.use(
  cors({
    origin: "*",
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Content-Length",
      "X-Requested-With",
      "Accept"
    ],
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

// API
api.get("/api/internal/metrics", internalMetrics);
api.get("/r/:id", handleShortUrlRequest);

exports.api = functions.https.onRequest(api);

// exports.fbPostFunction = functions
//   .region("asia-northeast1")
//   .firestore.document("photos/{productPictureId}")
//   .onCreate(doc => {
//     const db = admin.firestore();
//     const purchaseId = doc.data().purchase;
//     const pictureUrl = doc.data().picture_url;
//     return getPurchases(purchaseId)
//       .get()
//       .then(doc => {
//         const comment = doc.data().comment;

//         return request({
//           method: "POST",
//           url: "https://graph.facebook.com/v3.3/447511942679397/photos",
//           body: {
//             url: pictureUrl,
//             published: "true",
//             message: comment,
//             access_token: functions.config().facebook.pagetoken
//           },
//           json: true
//         });
//       });
//   });

const sendReviewSms = (snap, context) => {
  var db = admin.firestore();
  const purchaseDocId = context.params.documentId;
  const { customer_id, business_id } = snap.data();
  return new Promise((resolve, reject) => {
    if (!customer_id || !business_id) {
      console.log(
        `customer_id (${customer}) or business_id (${business_id}) empty. Not sending.`
      );
      return resolve();
    }
    getCustomers(customer_id)
      .get()
      .then(function(customerSnapshot) {
        const { first_name } = customerSnapshot.data();
        const { phone } = customerSnapshot.data();
        const { account_id } = customerSnapshot.data();
        return getBusinesses(business_id)
          .get()
          .then(function(businessSnapshot) {
            const { review_url, name } = businessSnapshot.data();
            const generatedId = createRandomId(4);
            const redirectUrl = DOMAINURL + "/r/" + generatedId;
            if (review_url) {
              const smsBody = {
                body: `Hi ${first_name}.\nWe hope you enjoyed your experience and would love your feedback. Please leave us a review: ${redirectUrl}. \nThanks. ${name}`,
                from: FROM_NUMBER, // testing: +15005550006,
                to: "+61" + phone
              };
              console.log(`Actually send SMS: ${JSON.stringify(smsBody)}`);
              console.log(`customer_id: ${customer_id}`);
              createBusinessShortUrl(generatedId, business_id, account_id);
              updateCollectionsBusinessURL(
                generatedId,
                customer_id,
                purchaseDocId
              );
              getMessages(generatedId).set({
                smsBody: smsBody.body,
                phone_num: phone,
                sent: false
              });
              return resolve()
            }
          });
      });
  });
};

const sendImageSms = (snap, context) => {
  const photo_id = context.params.documentId;
  var db = admin.firestore();
  let customerId = null;
  let customerPhoneRef = null;
  return new Promise((resolve, reject) => {
    if (!snap.data().picture_url || !snap.data().purchase) {
      return null;
    }
    return getPurchases(snap.data().purchase)
      .get()
      .then(ref => {
        customerId = ref.data().customer_id;
      })
      .then(() => {
        getCustomers(customerId)
          .get()
          .then(ref => {
            customerPhoneRef = ref.data().phone;
            if (customerPhoneRef) {
              const generatedId = createRandomId(4);
              const redirectUrl = DOMAINURL + "/r/" + generatedId;
              const smsBody = {
                body: `Congrats on your purchase. Here is your photo: ${redirectUrl}`,
                from: FROM_NUMBER,
                to: "+61" + customerPhoneRef
              };
              createPhotoShortUrl(
                generatedId,
                ref.data().business_id,
                snap.data().account_id,
                photo_id
              );
              updateCollectionsforPhotoURL(
                generatedId,
                customerId,
                snap.data().purchase,
                photo_id
              );
              getMessages(generatedId).set({
                smsBody: smsBody.body,
                phone_num: customerPhoneRef,
                sent: false
              });
              return resolve()
            }
          });
      });
  });
};

exports.indexPurchase = functions
  .region("asia-northeast1")
  .firestore.document("purchases/{purchaseId}")
  .onCreate((snap, context) => {
    // Get the note document
    const purchase = snap.data();

    // Add an 'objectID' field which Algolia requires
    purchase.objectID = context.params.purchaseId;

    // Write to the algolia index
    const index = client.initIndex(ALGOLIA_INDEX_PURCHASES);
    return index.saveObject(purchase);
  });

exports.updatePurchase = functions
  .region("asia-northeast1")
  .firestore.document("purchases/{purchaseId}")
  .onUpdate((snap, context) => {
    // Get the note document
    const purchase = snap.data();

    // Add an 'objectID' field which Algolia requires
    purchase.objectID = context.params.purchaseId;

    // Write to the algolia index
    const index = client.initIndex(ALGOLIA_INDEX_PURCHASES);
    return index.saveObject(purchase);
  });

exports.unIndexPurchase = functions
  .region("asia-northeast1")
  .firestore.document("purchases/{purchaseId}")
  .onDelete((snap, context) => {
    // Get the note document
    const purchase = snap.data();

    // Add an 'objectID' field which Algolia requires
    purchase.objectID = context.params.purchaseId;

    // Write to the algolia index
    const index = client.initIndex(ALGOLIA_INDEX_PURCHASES);
    return index.deleteObject(purchase);
  });

exports.indexCustomer = functions
  .region("asia-northeast1")
  .firestore.document("customers/{customerId}")
  .onCreate((snap, context) => {
    // Get the note document
    const customer = snap.data();

    // Add an 'objectID' field which Algolia requires
    customer.objectID = context.params.customerId;

    // Write to the algolia index
    const index = client.initIndex(ALGOLIA_INDEX_CUSTOMERS);
    return index.saveObject(customer);
  });

exports.updateCustomer = functions
  .region("asia-northeast1")
  .firestore.document("customers/{customerId}")
  .onUpdate((snap, context) => {
    if (!snap.exists) {
      return null;
    }
    // Get the note document
    const customer = snap.data();

    // Add an 'objectID' field which Algolia requires
    customer.objectID = context.params.customerId;

    // Write to the algolia index
    const index = client.initIndex(ALGOLIA_INDEX_CUSTOMERS);
    return index.saveObject(customer);
  });

exports.unIndexCustomer = functions
  .region("asia-northeast1")
  .firestore.document("customers/{customerId}")
  .onDelete((snap, context) => {
    // Get the note document
    const customer = snap.data();

    // Add an 'objectID' field which Algolia requires
    customer.objectID = context.params.customerId;

    // Write to the algolia index
    const index = client.initIndex(ALGOLIA_INDEX_CUSTOMERS);
    return index.deleteObject(customer);
  });

const addTimestampToDocument = collectionType => {
  return (snap, context) => {
    const docId = context.params.documentId;
    if (snap.data().created) {
      return null;
    }
    return getCollection(collectionType)
      .doc(docId)
      .update({ created: new Date() });
  };
};

const incrementCounter = propName => {
  return (collection, key) => {
    console.log(`Incrementing ${propName} on ${collection}/${key}`);
    if (!key) {
      return Promise.resolve();
    }
    const docRef = getDocument(collection)(key);
    return docRef.get().then(doc => {
      if (!doc.exists) {
        return Promise.resolve();
      }
      const obj = {};
      obj[propName] = doc.data()[propName] ? doc.data()[propName] + 1 : 1;
      return docRef.update(obj);
    });
  };
};

const incrementMessagesCounter = incrementCounter("message_count");
const incrementPhotosCounter = incrementCounter("photo_count");

const incrementAllMessagesCounts = ({ business_id, account_id }) => {
  console.log(`incrementAllMessagesCounts starting...`);
  return Promise.all([
    incrementMessagesCounter("businesses", business_id),
    incrementMessagesCounter("accounts", account_id)
  ]);
};

const updatePhotoCount = ({ business_id, account_id, purchase }) => {
  let purchaseRef = getPurchases(purchase);
  return purchaseRef.get().then(doc => {
    if (!doc.exists || !business_id || !account_id) {
      return Promise.resolve();
    }
    return incrementPhotosCounter("businesses", { business_id }).then(() =>
      incrementPhotosCounter("accounts", { account_id })
    );
  });
};

exports.addTimestampToAccounts = functions
  .region("asia-northeast1")
  .firestore.document("accounts/{documentId}")
  .onCreate(addTimestampToDocument("accounts"));

exports.addTimestampToBusinesses = functions
  .region("asia-northeast1")
  .firestore.document("businesses/{documentId}")
  .onCreate(addTimestampToDocument("businesses"));

exports.addTimestampToCustomers = functions
  .region("asia-northeast1")
  .firestore.document("customers/{documentId}")
  .onCreate(addTimestampToDocument("customers"));

exports.addTimestampToPhotos = functions
  .region("asia-northeast1")
  .firestore.document("photos/{documentId}")
  .onCreate(addTimestampToDocument("photos"));

exports.addTimestampToPurchases = functions
  .region("asia-northeast1")
  .firestore.document("purchases/{documentId}")
  .onCreate(addTimestampToDocument("purchases"));

exports.handleNewPurchase = functions
  .region("asia-northeast1")
  .firestore.document("/purchases/{documentId}")
  .onCreate((snap, context) => {
    const { business_id, account_id } = snap.data();
    return Promise.all([
      sendReviewSms(snap, context).then(() => {
        return incrementAllMessagesCounts({ business_id, account_id });
      })
    ]);
  });

exports.handleNewPhoto = functions
  .region("asia-northeast1")
  .firestore.document("/photos/{documentId}")
  .onCreate((snap, context) => {
    const { business_id, account_id, purchase } = snap.data();
    if (!purchase) {
      return null;
    }
    return sendImageSms(snap, context).then(() =>
      updatePhotoCount({ business_id, account_id, purchase })
    );
  });

function createRandomId(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let result = "";
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

exports.scheduledFunction = functions.pubsub.schedule('5 18 * * *')
.timeZone('Australia/Melbourne') // Users can choose timezone - default is America/Los_Angeles
.onRun((context) => {
  sendMessages()
  console.log("Sent Messages Terminated")
  return null;
});


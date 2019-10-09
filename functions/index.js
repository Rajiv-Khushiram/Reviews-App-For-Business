const functions = require("firebase-functions");
const admin = require("firebase-admin");
const request = require("request-promise");
const algoliasearch = require("algoliasearch");
const express = require("express");
const cors = require("cors");
const FROM_NUMBER = "+61480021420";
const {BigQuery} = require('@google-cloud/bigquery');

const addData = require("./addData")
const handleShortUrlRequest = require("./handle-short-url-request");
const internalMetrics = require("./api/internal-metrics");

const {
  createBusinessShortUrl,
  createPhotoShortUrl
} = require("./create-short-url");
const {
  getCollection,
  getDocument,
  getPurchases,
  getMessages,
  getBusinessesDoc,
  getCustomersDoc,
  getPurchasesDoc,
} = require("./database");
const {
  updateCollectionsBusinessURL,
  updateCollectionsforPhotoURL
} = require("./handle-url-update-for-collections");

const { dispatchSMS } = require("./sms-scheduler")
const bigqueryClient = new BigQuery();




// const ALGOLIA_ID = functions.config().algolia.app_id;
// const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;
// const ALGOLIA_SEARCH_KEY = functions.config().algolia.search_key;

// const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);
const api = express();

const ALGOLIA_INDEX_PURCHASES = "purchases";
const ALGOLIA_INDEX_CUSTOMERS = "customers";
const DOMAINURL = "https://rajivkhushiram-reviews-project.web.app";

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
async function bigqueryla () { 
  const sqlQuery = `SELECT
    CONCAT(
      'https://stackoverflow.com/questions/',
      CAST(id as STRING)) as url,
    view_count
    FROM \`bigquery-public-data.stackoverflow.posts_questions\`
    WHERE tags like '%google-bigquery%'
    ORDER BY view_count DESC
    LIMIT 10`;
  
    const options = {
      query: sqlQuery,
      // Location must match that of the dataset(s) referenced in the query.
      location: 'US',
    };
    
    const [rows] = await bigqueryClient.query(options);
    console.log([rows])
  }
// API

api.get("/api/internal/metrics", internalMetrics);
api.get("/r/:id", handleShortUrlRequest);
api.get("/sendMessages", dispatchSMS)
api.get("/addData", addData)
api.get("/bigqueryTest", bigqueryla)

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
  const purchaseDocId = context.params.documentId;
  const { customer_id, business_id } = snap.data();
  return new Promise((resolve, reject) => {
    if (!customer_id || !business_id) {
      console.log(
        `customer_id (${customer}) or business_id (${business_id}) empty. Not sending.`
      );
      return resolve();
    }
    getCustomersDoc(customer_id)
      .then(customerSnapshot => {
        const { first_name = '', phone = null, account_id = null } = customerSnapshot;
        return getBusinessesDoc(business_id)
          .then(businessSnapshot => {
            const { review_url, name } = businessSnapshot
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
              //  twilioClient.messages
              //   .create(smsBody)
              //   .then(() =>
              //     getCustomers(customer_id)
              //       .update({ sent_review: true })
              //       .then(() => resolve())
              //   )
              //   .catch(err => {
              //     console.log(`err`, err);
              //     reject(err);
              //   });
            }
          });
      });
  });
};

const sendImageSms = (snap, context) => {
  const photo_id = context.params.documentId;
  const image = snap.data();
  const purchase_id = snap.data().purchase 
  let   customer_id  = null;

  return new Promise((resolve, reject) => {
    if (!image || !image.picture_url || !purchase_id) {
      return null;
    }
    return getPurchasesDoc(purchase_id)
      .then(photoDoc => {
          customer_id   = photoDoc.customer_id
      })
      .then(() => {
        getCustomersDoc(customer_id)
          .then(customerDoc => {
            let  { phone, business_id } = customerDoc;
            if (phone) {
              const generatedId = createRandomId(4);
              const redirectUrl = DOMAINURL + "/r/" + generatedId;
              const smsBody = {
                body: `Congrats on your purchase. Here is your photo: ${redirectUrl}`,
                from: FROM_NUMBER,
                to: "+61" + phone
              };
              createPhotoShortUrl(
                generatedId,
                business_id,
                image.account_id || null,
                photo_id
              );
              updateCollectionsforPhotoURL(
                generatedId,
                customer_id,
                purchase_id,
                photo_id
              );
              getMessages(generatedId).set({
                smsBody: smsBody.body,
                phone_num: phone,
                sent: false
              });
              return resolve()
              //  twilioClient.messages
              //   .create(smsBody)
              //   .then(() => resolve())
              //   .then(() => getPhotos(photo_id).update({ picture_sent: true }));
            }
          });
      });
  });
};

// exports.indexPurchase = functions
//   .region("asia-northeast1")
//   .firestore.document("purchases/{purchaseId}")
//   .onCreate((snap, context) => {
//     // Get the note document
//     const purchase = snap.data();

//     // Add an 'objectID' field which Algolia requires
//     purchase.objectID = context.params.purchaseId;

//     // Write to the algolia index
//     const index = client.initIndex(ALGOLIA_INDEX_PURCHASES);
//     return index.saveObject(purchase);
//   });

// exports.updatePurchase = functions
//   .region("asia-northeast1")
//   .firestore.document("purchases/{purchaseId}")
//   .onUpdate((snap, context) => {
//     // Get the note document
//     const purchase = snap.data();

//     // Add an 'objectID' field which Algolia requires
//     purchase.objectID = context.params.purchaseId;

//     // Write to the algolia index
//     const index = client.initIndex(ALGOLIA_INDEX_PURCHASES);
//     return index.saveObject(purchase);
//   });

// exports.unIndexPurchase = functions
//   .region("asia-northeast1")
//   .firestore.document("purchases/{purchaseId}")
//   .onDelete((snap, context) => {
//     // Get the note document
//     const purchase = snap.data();

//     // Add an 'objectID' field which Algolia requires
//     purchase.objectID = context.params.purchaseId;

//     // Write to the algolia index
//     const index = client.initIndex(ALGOLIA_INDEX_PURCHASES);
//     return index.deleteObject(purchase);
//   });

// exports.indexCustomer = functions
//   .region("asia-northeast1")
//   .firestore.document("customers/{customerId}")
//   .onCreate((snap, context) => {
//     // Get the note document
//     const customer = snap.data();

//     // Add an 'objectID' field which Algolia requires
//     customer.objectID = context.params.customerId;

//     // Write to the algolia index
//     const index = client.initIndex(ALGOLIA_INDEX_CUSTOMERS);
//     return index.saveObject(customer);
//   });

// exports.updateCustomer = functions
//   .region("asia-northeast1")
//   .firestore.document("customers/{customerId}")
//   .onUpdate((snap, context) => {
//     if (!snap.exists) {
//       return null;
//     }
//     // Get the note document
//     const customer = snap.data();

//     // Add an 'objectID' field which Algolia requires
//     customer.objectID = context.params.customerId;

//     // Write to the algolia index
//     const index = client.initIndex(ALGOLIA_INDEX_CUSTOMERS);
//     return index.saveObject(customer);
//   });

// exports.unIndexCustomer = functions
//   .region("asia-northeast1")
//   .firestore.document("customers/{customerId}")
//   .onDelete((snap, context) => {
//     // Get the note document
//     const customer = snap.data();

//     // Add an 'objectID' field which Algolia requires
//     customer.objectID = context.params.customerId;

//     // Write to the algolia index
//     const index = client.initIndex(ALGOLIA_INDEX_CUSTOMERS);
//     return index.deleteObject(customer);
//   });

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

const updatePhotoCount = ({ purchase }) => {
  return getPurchasesDoc(purchase).then(purchaseDoc => {
    const { business_id, account_id} = purchaseDoc
    if ( !business_id || !account_id) {
      return Promise.resolve();
    }
    return incrementPhotosCounter("businesses", business_id ).then(() =>
      incrementPhotosCounter("accounts",  account_id )
    );
  }).catch(error => console.log(error));
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
    const { account_id, purchase } = snap.data();
    if (!purchase) {
      return null;
    }
    return sendImageSms(snap, context).then(() => {
        return updatePhotoCount({ purchase });
    });
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



exports.scheduledFunction = functions.pubsub.schedule('00 13 * * *')
.timeZone('Australia/Melbourne') // Users can choose timezone - default is America/Los_Angeles
.onRun((context) => {
  dispatchSMS()
  console.log("Sent Messages Terminated")
  return null;
});




// exports.dispatchBirdMessages = functions.pubsub
//   .schedule("every 1 minutes")
//   .onRun(context => {
//     return dispatchSMS()
//   });

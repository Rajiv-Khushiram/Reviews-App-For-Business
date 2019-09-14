"use strict";

const admin = require("firebase-admin");
let serviceAccount = require("./servicekey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
let db = admin.firestore();

const getBusinesses = () => {
  return new Promise(resolve => {
    let businesses = {};
    db.collection("businesses")
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          businesses[doc.id] = doc.data();
        });
        return resolve({ businesses });
      });
  });
};

const fetchPurchasesById = business => {
  return db
    .collection("purchases")
    .where("business_id", "==", business)
    .get();
};

const performSMSCounts = ({ businesses }) => {
  return new Promise((resolve, reject) => {
    let smsCounts = {};
    let promises = [];

    Object.keys(businesses).forEach(business => {
      promises.push(
        fetchPurchasesById(business).then(
          snapshot => (smsCounts[business] = snapshot.size)
        )
      );
    });

    Promise.all(promises).then(() => {
      return resolve({ businesses, smsCounts });
    });
  });
};

const mapPurchaseIdToBusiness = purchaseId => {
  return new Promise(resolve => {
    db.collection("purchases")
      .doc(purchaseId)
      .get()
      .then(snapshot => {
        return resolve(snapshot.data().business_id);
      });
  });
};

const updateBusinessMessageCounts = (docId, smsCounts) => {
  return new Promise(resolve => {
    db.collection("businesses")
      .doc(docId)
      .update({ message_count: smsCounts[docId] });
    resolve("message_count Synchronized");
  });
};

const updateBusinessImageCounts = (docId, imageCounts) => {
  return new Promise(resolve => {
    db.collection("businesses")
      .doc(docId)
      .update({ photo_count: imageCounts[docId] });
    resolve("photo_count Synchronized");
  });
};

const updateAccountsMessageCounts = (docId, smsCounts) => {
  return new Promise(resolve => {
    db.collection("accounts")
      .where("business", "==", docId)
      .get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          db.collection("accounts")
            .doc(doc.id)
            .update({ message_count: smsCounts[docId] });
        });
      })
      .then(()=> {
        resolve('done')
      });
  });
};

const updateAccountsImageCounts = (docId, imageCounts) => {
  return new Promise(resolve => {
    db.collection("accounts")
      .where("business", "==", docId)
      .get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
         db.collection("accounts")
            .doc(doc.id)
            .update({ photo_count: imageCounts[docId] }); 
        });
      }).then(()=> {
        resolve('done')
      });;
  });
};

const performImageCounts = ({ businesses, smsCounts }) => {
  return new Promise((resolve, reject) => {
    let promises = [];
    let imageCounts = {};

    db.collection("photos")
      .get()
      .then(snapshot => {
        snapshot.forEach(photo => {
          promises.push(
            mapPurchaseIdToBusiness(photo.data().purchase).then(businessId => {
              imageCounts[businessId] = imageCounts[businessId]
                ? imageCounts[businessId] + 1 : 1; // Increments the business count on imageCounts
            })
          );
        });
        return Promise.all(promises).then(() => {
          return resolve({ businesses, smsCounts, imageCounts });
        });
      });
  });
};

const syncBusinessCounts = ({ businesses, smsCounts, imageCounts }) => {
  return new Promise((resolve, reject) => {
    let promises = [];

    for (let smskey in smsCounts) {
      if (smsCounts.hasOwnProperty(smskey)) {
        promises.push(
          updateBusinessMessageCounts(smskey, smsCounts)
        );
      }
    }

    for (let imagekey in imageCounts) {
      if (imageCounts.hasOwnProperty(imagekey)) {
        promises.push(
          updateBusinessImageCounts(imagekey, imageCounts)
        )
      }
    }

    return Promise.all(promises).then(() => {
      return resolve({ businesses, smsCounts, imageCounts });
    });
  });
};

//1:1 assuming accounts and business is 1:1
const syncAccountCounts = ({ businesses, smsCounts, imageCounts }) => {
  return new Promise((resolve, reject) => {
    let promises = [];

    for (let smskey in smsCounts) {
      if (smsCounts.hasOwnProperty(smskey)) {
        promises.push(
          updateAccountsMessageCounts(smskey, smsCounts)
        )
      }
    }

    for (let imagekey in imageCounts) {
      if (imageCounts.hasOwnProperty(imagekey)) {
        promises.push(
           updateAccountsImageCounts(imagekey, imageCounts)
        )
      }
    }
    return Promise.all(promises).then(() => {
      return resolve({ businesses, smsCounts, imageCounts });
    });
  });
};

getBusinesses() // returns { businesses }
  .then(performSMSCounts) // returns { businesses, smsCounts }
  .then(performImageCounts) // returns { businesses, smsCounts, imageCounts }
  .then(syncBusinessCounts) // returns
  .then(syncAccountCounts) 
  .then(props => {
    console.log(props);
  });

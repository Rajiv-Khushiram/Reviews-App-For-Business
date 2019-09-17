const functions = require("firebase-functions");
const admin = require("firebase-admin");

const getCollection = type => {
  return admin
    .firestore()
    .collection(type)
}

const docRef = type => id => {
  return getCollection(type)
    .doc(id);
};

const getCollectionDocument = type => id => {
  return new Promise((resolve, reject) => {
    return  getCollection(type)
      .doc(id)
      .get()
      .then(response => {
        const data = response.data() || "Document does not Exist"
        if (!response.exists) {
          return reject(data);
        }
        return resolve(data);
      });
  })
};



module.exports = {  
  getCollection: getCollection,
  getDocument: docRef,
  getAccounts: docRef('accounts'),
  getBusinesses: docRef('businesses'),
  getCustomers: docRef('customers'),
  getPurchases: docRef("purchases"),
  getPhotos: docRef('photos'),
  getUrls: docRef('urls'),
  getMessages: docRef('messages'),
  getCollectionDocument: getCollectionDocument,
  getAccountsDoc: getCollectionDocument('accounts'),
  getBusinessesDoc: getCollectionDocument('businesses'),
  getCustomersDoc: getCollectionDocument('customers'),
  getMessagesDoc: getCollectionDocument('urls'),
  getPurchasesDoc: getCollectionDocument('purchases'),
  getPhotosDoc: getCollectionDocument('photos'),
  getUrlsDoc: getCollectionDocument('urls')

}
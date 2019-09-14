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

module.exports = {
  getCollection: getCollection,
  getDocument: docRef,
  getAccounts: docRef('accounts'),
  getBusinesses: docRef('businesses'),
  getCustomers: docRef('customers'),
  getPurchases: docRef("purchases"),
  getPhotos: docRef('photos'),
  getUrls: docRef('urls'),
  getMessages: docRef('messages')
}
const { getDocument } = require("./database");

const updateCollection = propName => {
  return (generatedId, collection, key) => {
    if (!key || !generatedId) {
      return Promise.resolve();
    }
    const docRef = getDocument(collection)(key);
    return docRef.get().then(doc => {
      if (!doc.exists) {
        return Promise.resolve();
      }
      const obj = {};
      obj[propName] = generatedId;
      return docRef.update(obj);
    });
  };
};

const updateCollectionForBusinessUrl = updateCollection("shortened_review_id");
const updateCollectionForPhotoUrl = updateCollection("shortened_photo_id");

const updateCollectionsBusinessURL = (
  generatedId,
  customersId,
  purchasesId
) => {
  return Promise.all([
    updateCollectionForBusinessUrl(generatedId, "customers", customersId),
    updateCollectionForBusinessUrl(generatedId, "purchases", purchasesId)
  ]);
};

const updateCollectionsforPhotoURL = (
  generatedId,
  customersId,
  purchasesId,
  photoId
) => {
  return Promise.all([
    updateCollectionForPhotoUrl(generatedId, "customers", customersId),
    updateCollectionForPhotoUrl(generatedId, "purchases", purchasesId),
    updateCollectionForPhotoUrl(generatedId, "photos", photoId)
  ]);
};

module.exports = {
  updateCollectionsBusinessURL: updateCollectionsBusinessURL,
  updateCollectionsforPhotoURL: updateCollectionsforPhotoURL
};

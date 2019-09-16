const { getUrls } = require("./database");

const storeURL = urlType => (generatedId, businessId, accountId, photoId) => {
  let data = {
    type: urlType,
    business_id: businessId,
    account_id: accountId,
    clicks: 0
  };
  if (photoId !== undefined) {
    data = { ...data, photo_id: photoId };
    return getUrls(generatedId).set(data);
  }
  return getUrls(generatedId).set(data);
};

module.exports = {
  createBusinessShortUrl: storeURL("business"),
  createPhotoShortUrl: storeURL("image")
};

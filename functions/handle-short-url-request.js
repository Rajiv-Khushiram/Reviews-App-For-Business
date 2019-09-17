const FieldValue = require("firebase-admin").firestore.FieldValue;
const { getBusinesses, getPhotos, getUrls } = require("./database");

module.exports = function(req, res) {
  var url_id = req.params.id;
  return getUrls(url_id)
    .get()
    .then(urlDoc => {
      if (!urlDoc.exists) {
        return res
          .status(404)
          .send("Looks like that link is no longer valid. Sorry about that.");
      }
      const urlData = urlDoc.data();
      getUrls(url_id).update({
        clicks: (urlData.clicks || 0) + 1,
        logs: FieldValue.arrayUnion(new Date())
      });
      if (urlData.type === "business" && urlData.business_id)
        return getBusinesses(urlData.business_id)
          .get()
          .then(businessDoc => {
            const businessData = businessDoc.data();
            if (!businessDoc.exists || !businessData.review_url) {
              return res.status(404).send("Error getting Review URL");
            }
            return res.redirect(businessData.review_url);
          });
      if (urlData.type === "image" && urlData.photo_id) {
        return getPhotos(urlDoc.data().photo_id)
          .get()
          .then(photoDoc => {
            const photoData = photoDoc.data();
            if (!photoDoc.exists || !photoData.picture_url) {
              return res.status(404).send("Error getting Photo ");
            }
            return res.redirect(photoData.picture_url);
          });
      }
    })
    .catch(err => {
      return res.status(404).send("Error getting URL Document");
    });
}
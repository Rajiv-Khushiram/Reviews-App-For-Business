const {
  getBusinesses,
  getPhotos,
  getUrls,
} = require('./database')

module.exports = function(req, res) {
  var url_id = req.params.id;
  return getUrls(url_id)
    .get()
    .then(urlDoc => {
      if (!urlDoc.exists || !urlDoc.data().hasOwnProperty('clicks')) {
        return res.status(404).send("Some Error Happened");
      }
      getUrls(url_id).update({ clicks: urlDoc.data().clicks + 1 });
      if (urlDoc.data().type === "business" && urlDoc.data().hasOwnProperty('business_id') ) {
        return getBusinesses(urlDoc.data().business_id)
          .get()
          .then(businessDoc => {
            if (!businessDoc.exists || !businessDoc.data().hasOwnProperty('review_url')) {
              return res.status(404).send("Error getting Review URL");
            }
            return res.redirect(businessDoc.data().review_url);
          });
      }
      if (urlDoc.data().type === "image" && urlDoc.data().hasOwnProperty('photo_id')) {
        return getPhotos(urlDoc.data().photo_id)
          .get()
          .then(photoDoc => {
            if (!photoDoc.exists || !photoDoc.data().hasOwnProperty('picture_url')) {
              return res.status(404).send("Error getting Photo ");
            }
            return res.redirect(photoDoc.data().picture_url);
          });
      }
    })
    .catch(err => {
      return res.status(404).send("Error getting URL Document");
    });
}
export const sendReview = review => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    const businessId = getState().account ? getState().account.business : null
    Promise.all([
      addCustomerDoc(review, businessId, getFirestore(), dispatch).then(() => {
        addPurchaseDoc(review, getFirestore(), dispatch, getState())
          .then(() => {
            addPhotoToBucketAndFs(
              getFirebase(),
              dispatch,
              getFirestore(),
              getState()
            );
          })
          .then(() => {
            console.log(
              "review had been added, and photo has been stored (if required)"
            );
            return dispatch({ type: "CREATE_REVIEW_SUCCESS", review: review });
          });
      })
    ]);
  };
};

const addCustomerDoc = (form, businessId, getFirestore, dispatch) => {
  return new Promise((resolve, reject) => {
    getFirestore
      .collection("customers")
      .add({
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        business_id: businessId
      })
      .then(customerRef => {
        dispatch({ type: "CREATE_CUSTOMER", data: customerRef });
        return resolve("Customer created", customerRef);
      })
      .catch(err => {
        return reject("customer promise error: ", err);
      });
  });
};

const addPurchaseDoc = (form, getFirestore, dispatch, getState) => {
  return new Promise((resolve, reject) => {
    getFirestore
      .collection("purchases")
                    .add({
        business_id: getState.account.business,
        comment: form.comments,
        customer_id: getState.review.customer,
        product_model: form.product_model,
        product_make: form.product_make,
        product_year: form.product_year
                    })
      .then(purchaseRef => {
        resolve("Purchase created");
        return dispatch({ type: "CREATE_PURCHASE", data: purchaseRef });
                  })
      .catch(err => {
        reject("Purchase promise error: ", err);
                });
  });
};

const addPhotoToBucketAndFs = (
  getFirebase,
  dispatch,
  getFirestore,
  getState
) => {
  return new Promise((resolve, reject) => {
    const id = getState.review.purchase;
    const pictureUri = getState.review.pictureUri;
    const reviewPictureStore = getFirebase
      .storage()
      .ref()
      .child("customer_product_photos/" + id);
    if (pictureUri) {
      getFirebase
        .storage()
        .ref()
        .child("customer_product_photos/" + id)
        .putString(pictureUri, "data_url")
        .then(() => {
          reviewPictureStore
            .getDownloadURL()
            .then(url => {
              getFirestore.collection("customer_product_photos").add({
                purchase: id,
                picture_url: url
              });
            })
            .then(() => {
              resolve("Photo Added");
              return dispatch({ type: "STORE_PHOTO" });
            });
        })
        .catch(err => {
          reject("Photo promise error: ", err);
        });
    }
  });
};

export const openCamera = () => {
  return dispatch => {
    dispatch({ type: "LAUNCH_CAMERA" });
  };
};

export const closeCamera = () => {
  return dispatch => {
    dispatch({ type: "CLOSE_CAMERA" });
  };
};

export const reDirectToForm = () => {
  return dispatch => {
    dispatch({ type: "REDIRECT_TO_FORM" });
  };
};

export const ontakePhoto = review => {
  return dispatch => {
    dispatch({ type: "CAPTURE_PHOTO", review: review });
  };
};

export const retryPhoto = () => {
  return dispatch => {
    dispatch({ type: "RETRY_PHOTO", for: "picturUrl" });
  };
};

export const removePhoto = () => {
  return dispatch => {
    dispatch({ type: "REMOVE_PHOTO", for: "picturUrl" });
  };
};

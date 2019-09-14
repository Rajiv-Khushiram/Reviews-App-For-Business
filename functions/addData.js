const functions = require("firebase-functions");
const admin = require("firebase-admin");

module.exports = function(req, res) {
    const addBusiness = () => {
    let bdata= { 
      "message_count" : 17,
      "name":"Auto Reviews",
      "photo_count":4,
      "review_url": "https://autorevie.ws"
     } 
      return admin
        .firestore()
        .collection("businesses").doc('Teoa73lp5u50RijMPqhf').set(bdata)
  
    };
  
    const addAccount = () => {
  
      let adata = {
        business: "Teoa73lp5u50RijMPqhf",
        email: "rajivkhushiram@hotmail.com",
        message_count: 17,
        name: "Rajiv",
        photo_count: 4
      }; 
  
      return admin
        .firestore()
        .collection("accounts").doc('YGEoq1WALpRIhwhXznp0CbEr1jD3').set(adata)
      };  
      
  
    const addCustomer = () => {
      let cdata = {
        business_id: "Teoa73lp5u50RijMPqhf",
        account_id : "YGEoq1WALpRIhwhXznp0CbEr1jD3",
        first_name: "Michel",
        last_name: "Rodriguez",
        phone: "0481187062",
        sent_review: true
      }; 
      return admin
        .firestore()
        .collection("customers").doc('ICbqGlIFMVMzIP9nTrKa').set(cdata)
    };
  
    const addPurchase = () => {
  
      let pdata = {
        business_id: "Teoa73lp5u50RijMPqhf",
        comment: "",
        customer_id: "ICbqGlIFMVMzIP9nTrKa",
        product_make: "Land Rover",
        product_model: "Discovery",
        account_id: "YGEoq1WALpRIhwhXznp0CbEr1jD3",
        product_year: 2019
      }; 
      return admin
      .firestore()
      .collection("purchases").doc('ICbqGlIFMVMzIP9nTrKa').set(pdata)  };
  
    const addPhoto = () => {
      let phodata = {
        picture_sent: true,
        account_id: "YGEoq1WALpRIhwhXznp0CbEr1jD3",
        picture_url:
          "https://firebasestorage.googleapis.com/v0/b/autoreviews/o/photos%2FVGrTeC8irxlttiHWjgN7?alt=media&token=8ede9c0f-3696-426d-acf9-3e767f5a60ee",
        purchase: "ICbqGlIFMVMzIP9nTrKa"
      }; 
  
      return admin
      .firestore()
      .collection("photos").add(phodata)
    };
  
    Promise.all([
      addBusiness(),
      addAccount(), 
      addCustomer(),
      addPurchase(),
      addPhoto()
    ]).then(result => {
      var obj = {};
      result.map((e, i) => {
        obj[Object.keys(e)[0]] = e[Object.keys(e)[0]];
      });
      res.status(200).send(obj);
    });
  };
  

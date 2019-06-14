const functions = require('firebase-functions');
const admin = require('firebase-admin');
const algoliasearch = require('algoliasearch');

const accountSid = (functions.config().twilio.test.accountsid);
const authToken =  (functions.config().twilio.test.authtoken);
const twilioClient = require('twilio')(accountSid, authToken);

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;
const ALGOLIA_SEARCH_KEY = functions.config().algolia.search_key;

const ALGOLIA_INDEX_NAME = 'purchases';
const ALGOLIA_INDEX_CUSTOMERS = 'customers';
const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

admin.initializeApp(functions.config().firebase);
const request = require('request-promise');

exports.sendReviewSms = functions.firestore.document('/customers/{documentId}')
    .onCreate((snap, context) => {
        var db = admin.firestore();
        const docId = context.params.documentId;
        if (!snap.data().phone || !snap.data().business_id || !snap.data().first_name)
        { 
            return null;
        } 
        return db.collection('business').doc(snap.data().business_id).get().then(function(documentSnapshot) {
            if (documentSnapshot.data().review_url) 
            {
                return twilioClient.messages
                    .create({
                        body: 'Hi '+ snap.data().first_name + '. Leave us a review at ' + documentSnapshot.data().review_url,
                        from: '+61488855773',    //'+15005550006',
                        to: '+61'+snap.data().phone
                    }).then(() => admin.firestore().collection('customers').doc(docId).update({askForReview: true})); ///
            }
        });
    });
    
exports.sendImageSms = functions.firestore.document('/customer_product_photos/{documentId}')
    .onCreate((snap, context) => {
        const docId = context.params.documentId;
        let purchaseReftoCustomer = null;
        let customerPhoneRef = null;
        if (!snap.data().picture_url || !snap.data().purchase)
        {
            return null;
        }
        return admin.firestore().collection('purchases').doc(snap.data().purchase).get()
            .then(ref => { 
                purchaseReftoCustomer = ref.data().customer_id;            
            })
            .then(() => {
                admin.firestore().collection('customers').doc(purchaseReftoCustomer).get()
                .then((ref=>  { 
                    customerPhoneRef = ref.data().phone                    
                    if (customerPhoneRef)
                    {
                    return twilioClient.messages
                        .create({
                            body: ' ' + JSON.stringify(snap.data().picture_url),
                            from: '+61488855773', //+
                            to: '+61'+customerPhoneRef
                        })
                        .then(message => admin.firestore().collection('customer_product_photos').doc(docId).update({askForPicture: true,
                        test:false}));
                    }
                    })
                )           
            });
    });
    exports.indexPurchase = functions.firestore.document('purchases/{purchaseId}').onCreate((snap, context) => {
        // Get the note document
        const purchase = snap.data();
      
        // Add an 'objectID' field which Algolia requires
        purchase.objectID = context.params.purchaseId;
      
        // Write to the algolia index
        const index = client.initIndex(ALGOLIA_INDEX_NAME);
        return index.saveObject(purchase);
      });

      exports.updatePurchase = functions.firestore.document('purchases/{purchaseId}').onUpdate((snap, context) => {
        // Get the note document
        const purchase = snap.data();
      
        // Add an 'objectID' field which Algolia requires
        purchase.objectID = context.params.purchaseId;
      
        // Write to the algolia index
        const index = client.initIndex(ALGOLIA_INDEX_NAME);
        return index.saveObject(purchase);
      });
    
      exports.unIndexPurchase = functions.firestore.document('purchases/{purchaseId}').onDelete((snap, context) => {
        // Get the note document
        const purchase = snap.data();
      
        // Add an 'objectID' field which Algolia requires
        purchase.objectID = context.params.purchaseId;
      
        // Write to the algolia index
        const index = client.initIndex(ALGOLIA_INDEX_NAME);
        return index.deleteObject(purchase);
      });
      exports.indexCustomer = functions.firestore.document('customers/{customerId}').onCreate((snap, context) => {
        // Get the note document
        const customer = snap.data();
      
        // Add an 'objectID' field which Algolia requires
        customer.objectID = context.params.customerId;
      
        // Write to the algolia index
        const index = client.initIndex(ALGOLIA_INDEX_CUSTOMERS);
        return index.saveObject(customer);
      });

      exports.updateCustomer = functions.firestore.document('customers/{customerId}').onUpdate((snap, context) => {
        // Get the note document
        const customer = snap.data();
      
        // Add an 'objectID' field which Algolia requires
        customer.objectID = context.params.customerId;
      
        // Write to the algolia index
        const index = client.initIndex(ALGOLIA_INDEX_CUSTOMERS);
        return index.saveObject(customer);
      });
    
      exports.unIndexCustomer = functions.firestore.document('customers/{customerId}').onDelete((snap, context) => {
        // Get the note document
        const customer = snap.data();
      
        // Add an 'objectID' field which Algolia requires
        customer.objectID = context.params.customerId;
      
        // Write to the algolia index
        const index = client.initIndex(ALGOLIA_INDEX_CUSTOMERS);
        return index.deleteObject(customer);
      });

      exports.fbPostFunction = functions.firestore.document('customer_product_photos/{productPictureId}').onCreate(doc => {
        const db =admin.firestore();
        const purchaseId = doc.data().purchase;
        const pictureUrl = doc.data().picture_url;
    
    
        return db.collection('purchases').doc(purchaseId).get().then( doc => {
            const comment = doc.data().comment;
    
            return request({
                method:'POST',
                url:'https://graph.facebook.com/v3.3/447511942679397/photos',
                body:{
                    url:pictureUrl,
                    published:'true',
                    message:comment,
                    access_token:functions.config().facebook.pagetoken
                },
                json:true
            })
    
    
        })
    })
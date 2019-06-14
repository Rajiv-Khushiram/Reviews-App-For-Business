export const getPhoto = () => {
    return (dispatch, getState, { getFirebase, getFirestore }) => {
        console.log('Starting getPhoto action')
        const firebase = getFirebase();
        const db = firebase.firestore();
        const business = getState().account.business
        const comments = [];
        const query = [];
        db.collection('purchases').where('business_id','==',business) 
        .get()
        .then(purchaseRef => { 
            if (purchaseRef.empty) {
                console.log('No matching purchase documents.');
                return;
            }
            purchaseRef.forEach(purchasedoc => {
                db.collection('customer_product_photos').where('purchase','==',purchasedoc.id)
                .get().then(photo => {
                    if(photo.empty) {
                        console.log('No matching photo documents.');
                        return;
                    }
                    else{
                        photo.forEach(photodoc => {
                            comments.push(purchasedoc.data());
                            query.push(photodoc.data());
                        });
                    }        
                })
               
            });          
        })   
        .then(() => {
            dispatch({ type: "LIST_PHOTO_SUCCESS", comments, query});
        })
        .catch(err => {
            console.log('Error getting documents');
            dispatch({ type: "LIST_PHOTO_ERR", err});
        });  
    }
  }
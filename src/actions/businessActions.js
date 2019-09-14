export const getBusiness = () => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    console.log('Starting getBusiness action')
    const firebase = getFirebase();
    const db = firebase.firestore();
    const {account = {}} = getState();
    const {business = false} = account;

    if(!business) return;
    
    const ref = db.collection('businesses').doc(account.business);
    
    dispatch({ type: "GET_BUSINESS", id: account.business });

    return ref.get()
      .then((res) => {
        console.log('Finishing getBusiness action', res.data())
        return dispatch({ type: "GET_BUSINESS_SUCCESS" , data: res.data() });
      })
      .catch(err => {
        console.log(err);
        dispatch({ type: "GET_BUSINESS_FAILURE" , err });
      });     
  }
}
export const getAccount = () => {
  return (dispatch, getState, { getFirebase, getFirestore }) => {
    console.log('Starting getAccount action')
    const firebase = getFirebase();
    const db = firebase.firestore();
    const auth = getState().firebase.auth
    const uid = auth && auth.uid;
    const ref = db.collection('accounts').doc(uid);

    dispatch({ type: "GET_ACCOUNT" , for: uid });

    return ref.get()
      .then((res) => {
        console.log('Finishing getAccount action',res.data())
        return dispatch({ type: "GET_ACCOUNT_SUCCESS" , data: res.data() });
      })
      .catch(err => {
        console.log(err);
        dispatch({ type: "GET_ACCOUNT_FAILURE" , err });
      });
  }
}
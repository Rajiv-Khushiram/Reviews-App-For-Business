export const signIn = ( credential ) => {
    return  ( dispatch, getState, {getFirebase} ) => {
        const firebase = getFirebase();
        console.log('stated login')
        dispatch({ type:'LOGIN_STARTED'})


        firebase.auth().signInWithEmailAndPassword(
            credential.email,
            credential.password
        ).then( () => {
            console.log("success login")
            return dispatch({ type:'LOGIN_SUCCESS'})
        }).catch( (err) => {
            console.log("failed login")
            dispatch({ type:'LOGIN_ERROR', err})
        })
    }
}

export const signOut = () => {
    return (dispatch, getState, {getFirebase}) => {
        const firebase = getFirebase();

        firebase.auth().signOut().then( () => {
            dispatch({ type:'SIGNOUT_SUCCESS'});
        })
    }
}



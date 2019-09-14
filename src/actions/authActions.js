export const signIn = credential => {
  return (dispatch, getState, { getFirebase }) => {
    const firebase = getFirebase();
    dispatch({ type: "LOGIN_STARTED" });

    firebase
      .auth()
      .signInWithEmailAndPassword(credential.email, credential.password)
      .then(() => {
        return dispatch({ type: "LOGIN_SUCCESS" });
      })
      .catch(err => {
        dispatch({ type: "LOGIN_ERROR", err });
      });
  };
};

export const signOut = () => {
  return (dispatch, getState, { getFirebase }) => {
    const firebase = getFirebase();

    firebase
      .auth()
      .signOut()
      .then(() => {
        dispatch({ type: "SIGNOUT_SUCCESS" });
      });
  };
};

export const changePassword = ({ current_password, new_password }) => {
  return (dispatch, getState, { getFirebase }) => {
    return Promise.all([
      reauthenticateUser(current_password, getFirebase(), dispatch).then(() => {
        return updatepassword(new_password, getFirebase(), dispatch);
      })
    ]).then(() => {
      return dispatch({ type: "PASSWORD_CHANGED_SUCCESS" });
    });
  };
};

const reauthenticateUser = (password, getFirebase, dispatch) => {
  return new Promise((resolve, reject) => {
    const firebase = getFirebase;
    var user = firebase.auth().currentUser;
    const credential = firebase.auth.EmailAuthProvider.credential(
      user.email,
      password
    );
    return user
      .reauthenticateWithCredential(credential)
      .then(function() {
        dispatch({ type: "REAUTHENTICATE_SUCCESS" });
        return resolve("Aunthenticated Success");
      })
      .catch(function(error) {
        return reject(error);
      });
  });
};

const updatepassword = (newPassword, getFirebase, dispatch) => {
  return new Promise((resolve, reject) => {
    const firebase = getFirebase;
    var user = firebase.auth().currentUser;
    user
      .updatePassword(newPassword)
      .then(function() {
        return resolve();
      })
      .catch(function(error) {
        return reject("change password promise error: ", error);
      });
  });
};

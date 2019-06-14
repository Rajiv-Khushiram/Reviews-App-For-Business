import authReducer from './authReducer';
import businessReducer from './businessReducer';
import accountReducer from './accountReducer';
import reviewReducer from './reviewReducer';
import searchReducer from './searchReducer';
import photoReducer from './photoReducer';
import { combineReducers } from 'redux';
import { firestoreReducer } from 'redux-firestore';
import { firebaseReducer } from 'react-redux-firebase';

const rootReducer = combineReducers({
    auth: authReducer,
    account: accountReducer,
    business: businessReducer,
    review: reviewReducer,
    search: searchReducer,
    photo: photoReducer,
    firestore:firestoreReducer,
    firebase:firebaseReducer
});

export default rootReducer;
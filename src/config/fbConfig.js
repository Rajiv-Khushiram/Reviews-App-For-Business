import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

// Initialize Firebase
var firebaseConfig = {
  apiKey: "AIzaSyCeos02Q0Yhe-_aZrbm9fBNOhYhK_JuHcI",
  authDomain: "rajivkhushiram-reviews-project.firebaseapp.com",
  databaseURL: "https://rajivkhushiram-reviews-project.firebaseio.com",
  projectId: "rajivkhushiram-reviews-project",
  storageBucket: "rajivkhushiram-reviews-project.appspot.com",
  messagingSenderId: "838832911035",
  appId: "1:838832911035:web:c2da541766007e26"
};
firebase.initializeApp(firebaseConfig);


export default firebase;

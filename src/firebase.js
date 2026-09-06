import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBqd_NK7P7nUSE77E0K08OMke62wc9bvIU",
  authDomain: "vatlythayhuynh.firebaseapp.com",
  projectId: "vatlythayhuynh",
  storageBucket: "vatlythayhuynh.appspot.com",
  messagingSenderId: "758843252383",
  appId: "1:758843252383:web:d00b55466720089fb4caa"
};

const app = initializeApp(firebaseConfig);
export const firestoreDb = getFirestore(app);
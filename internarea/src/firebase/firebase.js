// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-5LLtlp1YQeXZN9v-JFfjhhbHqmME9bc",
  authDomain: "internarea-607af.firebaseapp.com",
  projectId: "internarea-607af",
  storageBucket: "internarea-607af.firebasestorage.app",
  messagingSenderId: "900565876638",
  appId: "1:900565876638:web:8111863932cddc3e77a08f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };


// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries
// import { getAuth, GoogleAuthProvider } from "firebase/auth";
// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyDbYTYs_oSK2rvtzHxBCPFrqdXM-l7MokQ",
//   authDomain: "internshala-9e300.firebaseapp.com",
//   projectId: "internshala-9e300",
//   storageBucket: "internshala-9e300.firebasestorage.app",
//   messagingSenderId: "304425115290",
//   appId: "1:304425115290:web:1b0653f1acd4192b848923",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const provider = new GoogleAuthProvider();
// export { auth, provider };

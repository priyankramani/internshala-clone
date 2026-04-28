import Script from "next/script";
import Footer from "@/Components/Footer";
import Navbar from "@/Components/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { store } from "../store/store";
import { Provider, useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

import axios from "axios";

import { auth } from "@/firebase/firebase";
import { login, logout } from "@/Feature/Userslice";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "@/i18n";
import { selectLanguage } from "@/Feature/languageSlice";
import i18n from "@/i18n";

// Sync Language
function LanguageSync() {
  const lang = useSelector(selectLanguage);

  useEffect(() => {
    if (lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  return null;
}

// Firebase Auth Listener
function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authuser) => {
      if (!authuser) {
        dispatch(logout());
        return;
      }

      if (window.location.pathname === "/otp-verify") return;

      try {
        const otpVerified = sessionStorage.getItem("otp_verified") === "true";

        const res = await axios.post(
          "https://internshala-clone-uclt.onrender.com/api/login/track",
          {
            userId: authuser.uid,
            email: authuser.email,
            skipOTP: otpVerified,
          },
        );

        // MOBILE BLOCK
        if (res.data?.message?.includes("Mobile login")) {
          alert(res.data.message);
          await auth.signOut();
          return;
        }

        // OTP REQUIRED
        if (res.data.requireOTP) {
          sessionStorage.setItem("otp_user", JSON.stringify(authuser));
          window.location.href = "/otp-verify";
          return;
        }

        // NORMAL LOGIN
        dispatch(
          login({
            uid: authuser.uid,
            photo: authuser.photoURL,
            name: authuser.displayName,
            email: authuser.email,
            phontNumber: authuser.phoneNumber,
          }),
        );
      } catch (err: any) {
        alert(err.response?.data?.message || "Login error");
        await auth.signOut();
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="beforeInteractive"
      />

      <AuthListener />
      <LanguageSync />

      <div className="bg-white">
        <ToastContainer />
        <Navbar />
        <Component {...pageProps} />
        <Footer />
      </div>
    </Provider>
  );
}

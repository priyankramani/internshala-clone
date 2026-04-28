import { useEffect, useState } from "react";
import Link from "next/link";
import { auth, provider } from "../firebase/firebase";
import { Search } from "lucide-react";
import { signInWithPopup, signOut } from "firebase/auth";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { selectuser } from "@/Feature/Userslice";
import { setLanguage } from "@/Feature/languageSlice";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

const Navbar = () => {
  const user = useSelector(selectuser);
  const currentLang = useSelector((state: any) => state.language.lang);
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const [lang, setLang] = useState("en");

  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingLang, setPendingLang] = useState("");

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  // ✅ Sync Redux language -> i18n + local state
  useEffect(() => {
    if (currentLang) {
      i18n.changeLanguage(currentLang);
      setLang(currentLang);
    }
  }, [currentLang]);

  // ✅ LOGIN
  const handlelogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast.success(t("auth.loginSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("auth.loginFail"));
    }
  };

  const handleEmailAuth = async () => {
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Account created");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in");
      }
      setShowEmailModal(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // FORGOT PASSWORD
  // const handleForgotPassword = async () => {
  //   if (!email) {
  //     toast.error("Enter your email first");
  //     return;
  //   }

  //   try {
  //     await sendPasswordResetEmail(auth, email);
  //     toast.success("Password reset email sent");
  //   } catch (error: any) {
  //     toast.error(error.message);
  //   }
  // };
  // ✅ LOGOUT
  const handlelogout = () => {
    signOut(auth);
    toast.success(t("auth.logout"));
  };

  // ✅ LANGUAGE CHANGE
  const handleLanguageChange = async (newLang: string) => {
    if (newLang === "fr") {
      if (!user?.email) {
        toast.error("Please login first");
        return;
      }

      try {
        await axios.post("http://localhost:5000/api/otp/send-otp", {
          email: user.email,
        });

        toast.success("OTP sent to your email");
        setPendingLang("fr");
        setShowOtpInput(true);
      } catch (err) {
        toast.error("Failed to send OTP");
      }
    } else {
      dispatch(setLanguage(newLang));
      i18n.changeLanguage(newLang);
      setLang(newLang);
    }
  };

  // ✅ VERIFY OTP
  const verifyOtp = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/otp/verify-otp", {
        email: user.email,
        otp,
      });

      if (res.data.success) {
        dispatch(setLanguage(pendingLang));
        i18n.changeLanguage(pendingLang);
        setLang(pendingLang);

        toast.success("French language enabled");
        setShowOtpInput(false);
        setOtp("");
      }
    } catch (err) {
      toast.error("Invalid OTP");
    }
  };

  return (
    <div className="relative">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-xl font-bold text-blue-600">
                <img src="/logo.png" alt="logo" className="h-16" />
              </Link>
            </div>

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/internship">
                <span className="text-gray-700 hover:text-blue-600">
                  {t("navbar.internships")}
                </span>
              </Link>

              <Link href="/job">
                <span className="text-gray-700 hover:text-blue-600">
                  {t("navbar.jobs")}
                </span>
              </Link>

              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder={t("navbar.search")}
                  className="ml-2 bg-transparent focus:outline-none text-sm w-48"
                />
              </div>
            </div>

            <a href="/publicspace">Public Space</a>
            <a href="/friends">Friends</a>
            {/* Language Selector */}
            <select
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="border px-2 py-1 rounded"
              value={lang}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="hi">Hindi</option>
              <option value="pt">Portuguese</option>
              <option value="zh">Chinese</option>
              <option value="fr">French</option>
            </select>

            {/* OTP MODAL */}
            {showOtpInput && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h2 className="text-lg font-bold mb-4">Enter OTP</h2>

                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="border px-4 py-2 mb-4 w-full"
                  />

                  <button
                    onClick={verifyOtp}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}

            {/* Email Login Modal */}
            {showEmailModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg w-96">
                  <h2 className="text-xl font-bold mb-4">
                    {isSignup ? "Sign Up" : "Login"}
                  </h2>

                  <input
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border px-4 py-2 mb-3 w-full"
                  />

                  <input
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border px-4 py-2 mb-3 w-full"
                  />

                  <button
                    onClick={handleEmailAuth}
                    className="bg-blue-600 text-white px-4 py-2 w-full rounded mb-2"
                  >
                    {isSignup ? "Sign Up" : "Login"}
                  </button>

                  <Link href="/forgot-password">
                    <span
                      onClick={() => setShowEmailModal(false)}
                      className="text-blue-600 text-sm cursor-pointer"
                    >
                      Forgot Password?
                    </span>
                  </Link>
                  {/* 🔥 Forgot Password */}
                  {/* {!isSignup && (
                    <button
                      onClick={handleForgotPassword}
                      className="text-blue-600 text-sm mb-2"
                    >
                      Forgot Password?
                    </button>
                  )} */}

                  <p
                    className="text-sm cursor-pointer text-gray-600"
                    onClick={() => setIsSignup(!isSignup)}
                  >
                    {isSignup
                      ? "Already have an account? Login"
                      : "Don't have an account? Sign up"}
                  </p>

                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="mt-3 text-red-500 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Auth */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/profile">
                    <img
                      src={user.photo}
                      alt="user"
                      className="w-8 h-8 rounded-full"
                    />
                  </Link>

                  <button
                    onClick={handlelogout}
                    className="text-gray-700 hover:bg-gray-200 px-3 py-1 rounded"
                  >
                    {t("navbar.logout")}
                  </button>
                </div>
              ) : (
                <>
                  {/* 🔥 NEW Email Login Button */}
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="border px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Login
                  </button>

                  {/* Google Login */}
                  <button
                    onClick={handlelogin}
                    className="border px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Continue with Google
                  </button>

                  <a
                    href="/adminlogin"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Admin
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;

import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "@/Feature/Userslice";

export default function OTPVerify() {
  const [otp, setOtp] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  // ✅ Load user safely from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("otp_user");

      if (!stored) {
        alert("Session expired. Please login again.");
        window.location.href = "/";
        return;
      }

      setUser(JSON.parse(stored));
      setLoading(false);
    }
  }, []);

  const verifyOTP = async () => {
    try {
      if (!user) {
        alert("User not found. Please login again.");
        return;
      }

      // ✅ VERIFY OTP
      const res = await axios.post(
        "https://internshala-clone-uclt.onrender.com/api/otp/verify",
        {
          email: user.email,
          otp,
        },
      );

      if (!res.data.success) {
        alert("Invalid OTP");
        return;
      }

      // 🔥 IMPORTANT: Mark OTP as verified
      sessionStorage.setItem("otp_verified", "true");

      // ✅ CALL TRACK AGAIN (skip OTP)
      await axios.post(
        "https://internshala-clone-uclt.onrender.com/api/login/track",
        {
          userId: user.uid,
          email: user.email,
          skipOTP: true,
        },
      );

      // ✅ RESTORE USER (Redux)
      dispatch(
        login({
          uid: user.uid,
          photo: user.photoURL,
          name: user.displayName,
          email: user.email,
          phontNumber: user.phoneNumber,
        }),
      );

      // ✅ SAVE USER (optional but recommended)
      await axios.post(
        "https://internshala-clone-uclt.onrender.com/api/user/save",
        {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
        },
      );

      // ✅ CLEANUP SESSION
      sessionStorage.removeItem("otp_user");

      // ⛔ DO NOT remove otp_verified here
      // It is needed to prevent loop

      // ✅ REDIRECT AFTER SMALL DELAY (important for Redux/UI sync)
      setTimeout(() => {
        window.location.href = "/";
      }, 300);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "OTP verification failed");
    }
  };

  // ✅ Proper loading state
  if (loading) {
    return <p className="p-6 text-center">Loading...</p>;
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold">OTP Verification</h1>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="border p-2 w-full mt-4"
      />

      <button
        onClick={verifyOTP}
        className="bg-blue-500 text-white px-4 py-2 mt-4 w-full"
      >
        Verify OTP
      </button>
    </div>
  );
}

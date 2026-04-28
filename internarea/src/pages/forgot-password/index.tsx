import { useEffect, useState } from "react";
import { resetPassword } from "@/firebase/firebase";
import { toast } from "react-toastify";
import Link from "next/link";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [generatedPassword, setGeneratedPassword] = useState("");

  useEffect(() => {
    const lastRequest = localStorage.getItem("resetRequest");

    if (lastRequest) {
      const lastTime = new Date(lastRequest).getTime();
      const now = Date.now();

      const diff = now - lastTime;
      const remaining = 24 * 60 * 60 * 1000 - diff;

      if (remaining > 0) {
        setCooldown(Math.floor(remaining / 1000));
      }
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    let result = "";

    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setGeneratedPassword(result);

    navigator.clipboard.writeText(result);

    toast.success("Password generated & copied");
  };

  const handleReset = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      // 🔥 Step 1: Check backend restriction
      await axios.post(
        "https://internshala-clone-uclt.onrender.com/api/reset/request-reset",
        {
          email,
        },
      );

      // 🔥 Step 2: Firebase reset email
      await resetPassword(email);

      toast.success("Reset link sent to your email");

      // optional: store locally for UX
      localStorage.setItem("resetRequest", new Date().toISOString());
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("You can use this option only once per day.");
      } else if (error.code === "auth/user-not-found") {
        toast.error("No account found with this email");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Reset Password</h1>

        <p className="text-gray-500 text-sm text-center mb-6">
          Enter your registered email to receive a reset link
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="mb-4">
          <button
            onClick={generatePassword}
            className="bg-green-600 text-white px-4 py-2 rounded-lg w-full"
          >
            Generate Secure Password
          </button>

          {generatedPassword && (
            <div className="mt-3 border p-3 rounded-lg bg-gray-100">
              <p className="text-sm text-gray-600 mb-1">Generated Password:</p>

              <p className="font-bold break-all">{generatedPassword}</p>

              <p className="text-xs text-green-600 mt-1">Copied to clipboard</p>
            </div>
          )}
        </div>

        <button
          onClick={handleReset}
          disabled={cooldown > 0}
          className={`px-4 py-3 w-full rounded-lg text-white ${
            cooldown > 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {cooldown > 0
            ? `Try again in ${Math.floor(cooldown / 3600)}h ${Math.floor(
                (cooldown % 3600) / 60,
              )}m`
            : "Send Reset Link"}
        </button>

        <Link href="/">
          <p className="text-center text-sm text-blue-600 mt-4 cursor-pointer">
            Back to Home
          </p>
        </Link>
      </div>
    </div>
  );
}

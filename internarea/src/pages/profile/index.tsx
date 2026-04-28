import { selectuser } from "@/Feature/Userslice";
import { ExternalLink, Mail, User } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const ProfilePage = () => {
  const user = useSelector(selectuser);

  const [hasResume, setHasResume] = useState(false);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);

  // ✅ NEW STATES
  const [subscription, setSubscription] = useState<any>(null);
  const [stats, setStats] = useState({ active: 0, accepted: 0 });

  const [usedCount, setUsedCount] = useState(0);

  useEffect(() => {
    if (!user?.email) return;

    axios
      .get(
        `https://internshala-clone-uclt.onrender.com/api/application/count/${user.email}`,
      )
      .then((res) => {
        setUsedCount(res.data.count);
      })
      .catch(console.log);
  }, [user?.email]);

  // 🔹 LOGIN HISTORY (OLD)
  useEffect(() => {
    if (!user?.uid) return;

    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `https://internshala-clone-uclt.onrender.com/api/login/${user.uid}`,
        );
        setLoginHistory(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchHistory();
  }, [user]);

  // 🔹 CHECK RESUME (OLD)
  useEffect(() => {
    if (!user?.email) return;

    axios
      .get(
        `https://internshala-clone-uclt.onrender.com/api/resume/get-resume/${user.email}`,
      )
      .then((res) => {
        if (res.data && Object.keys(res.data).length > 0) {
          setHasResume(true);
        }
      })
      .catch(console.log);
  }, [user]);

  // ✅ FETCH SUBSCRIPTION (NEW)
  // useEffect(() => {
  //   if (!user?.email) return;

  //   const fetchSub = async () => {
  //     try {
  //       const res = await axios.get(
  //         `https://internshala-clone-uclt.onrender.com/api/resume/subscription/${user.email}`,
  //       );
  //       setSubscription(res.data);
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };

  //   fetchSub();
  // }, [user]);

  // ✅ FETCH APPLICATION STATS (NEW)
  useEffect(() => {
    if (!user?.email) return;

    const fetchSub = async () => {
      try {
        const res = await axios.get(
          `https://internshala-clone-uclt.onrender.com/api/resume/subscription/${user.email}`,
        );

        console.log("SUB DATA:", res.data); // 🔥 DEBUG

        setSubscription(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchSub();
  }, [user?.email]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* HEADER */}
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              {user?.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* CONTENT */}
          <div className="pt-16 pb-8 px-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
              <div className="mt-2 flex items-center justify-center text-gray-500">
                <Mail className="h-4 w-4 mr-2" />
                <span>{user?.email}</span>
              </div>
            </div>

            {/* ✅ SUBSCRIPTION CARD (NEW) */}
            <div className="bg-purple-50 rounded-lg p-4 text-center mb-6">
              <h2 className="text-purple-700 font-semibold text-lg">
                {subscription?.plan
                  ? `${subscription.plan.toUpperCase()} PLAN`
                  : "FREE PLAN"}
              </h2>

              <p className="text-purple-600 mt-1">
                Remaining Applications:{" "}
                {subscription
                  ? subscription.applicationLimit === -1
                    ? "Unlimited"
                    : Number(subscription.applicationLimit || 0) - usedCount
                  : "1 per month"}
              </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <span className="text-blue-600 font-semibold text-2xl">
                  {stats.active}
                </span>
                <p className="text-blue-600 text-sm mt-1">
                  Active Applications
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 text-center">
                <span className="text-green-600 font-semibold text-2xl">
                  {stats.accepted}
                </span>
                <p className="text-green-600 text-sm mt-1">
                  Accepted Applications
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-center pt-4">
              <Link
                href="/userapplication"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                View Applications
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="flex justify-center mt-4 gap-3">
              <Link href="/resume">
                <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg shadow">
                  {hasResume ? "View Resume" : "Create Resume"}
                </button>
              </Link>

              {/* ✅ NEW UPGRADE BUTTON */}
              <Link href="/subscription">
                <button className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700">
                  Upgrade Plan
                </button>
              </Link>
            </div>

            {/* LOGIN HISTORY (UNCHANGED) */}
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Login History
              </h2>

              {loginHistory.length === 0 ? (
                <p className="text-gray-500">No login history available</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {loginHistory.map((item, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 bg-gray-50 text-sm"
                    >
                      <p>
                        <strong>Browser:</strong> {item.browser}
                      </p>
                      <p>
                        <strong>OS:</strong> {item.os}
                      </p>
                      <p>
                        <strong>Device:</strong> {item.device}
                      </p>
                      <p>
                        <strong>IP:</strong> {item.ip}
                      </p>
                      <p className="text-gray-500">
                        {new Date(item.loginTime).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

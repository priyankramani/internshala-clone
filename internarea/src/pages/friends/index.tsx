import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";

export default function Friends() {
  const user = useSelector(selectuser);

  const [data, setData] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const BASE = "https://internshala-clone-uclt.onrender.com/api/friend";

  // ✅ Fetch friend data
  const fetchData = async (uid: string) => {
    try {
      const res = await axios.get(`${BASE}/${uid}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Wait for user
  useEffect(() => {
    if (user?.uid) {
      setLoadingUser(false);
      fetchData(user.uid);
    }
  }, [user]);

  // 🔍 Search users by email
  const searchUsers = async (value: string) => {
    setSearch(value);

    if (!value) return setResults([]);

    try {
      const res = await axios.get(
        `https://internshala-clone-uclt.onrender.com/api/user/search?email=${value}`,
      );
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🤝 Send request
  const sendRequest = async (toUserId: string) => {
    try {
      await axios.post(`${BASE}/send`, {
        fromUserId: user.uid,
        toUserId,
      });
      fetchData(user.uid);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error sending request");
    }
  };

  const accept = async (id: string) => {
    await axios.post(`${BASE}/accept`, {
      userId: user.uid,
      fromUserId: id,
    });
    fetchData(user.uid);
  };

  const reject = async (id: string) => {
    await axios.post(`${BASE}/reject`, {
      userId: user.uid,
      fromUserId: id,
    });
    fetchData(user.uid);
  };

  if (loadingUser) return <p>Loading user...</p>;
  if (!data) return <p>Loading friends data...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">Friends</h1>

      {/* 🔍 SEARCH */}
      <input
        placeholder="Search by email..."
        value={search}
        onChange={(e) => searchUsers(e.target.value)}
        className="border p-2 mt-2 w-full"
      />

      {results.map((u) => (
        <div key={u.uid} className="flex justify-between border p-2 mt-2">
          <span>{u.email}</span>
          <button
            onClick={() => sendRequest(u.uid)}
            className="bg-blue-500 text-white px-2 py-1"
          >
            Add
          </button>
        </div>
      ))}

      {/* 📥 Requests */}
      <h2 className="mt-4 font-bold">Requests Received</h2>
      {data.requestsReceived.length === 0 && <p>No requests</p>}
      {data.requestsData.map((u: any) => (
        <div key={u.uid} className="flex gap-2 items-center mt-1">
          <span>{u.email}</span>
          <button
            onClick={() => accept(u.uid)}
            className="bg-green-500 text-white px-2 py-1"
          >
            Accept
          </button>
          <button
            onClick={() => reject(u.uid)}
            className="bg-red-500 text-white px-2 py-1"
          >
            Reject
          </button>
        </div>
      ))}

      {/* 👥 Friends */}
      <h2 className="mt-4 font-bold">Friends List</h2>
      {data.friends.length === 0 && <p>No friends yet</p>}
      {data.friendsData.map((u: any) => (
        <p key={u.uid}>{u.email}</p>
      ))}
    </div>
  );
}

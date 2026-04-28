import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { selectuser } from "@/Feature/Userslice";

export default function PublicSpace() {
  const user = useSelector(selectuser);

  const [posts, setPosts] = useState<any[]>([]);
  const [file, setFile] = useState<any>(null);
  const [caption, setCaption] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://internshala-clone-uclt.onrender.com/api/post";

  // Fetch posts safely
  const fetchPosts = async (uid: string) => {
    try {
      const res = await axios.get(`${BASE_URL}/${uid}`);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Wait for user
  useEffect(() => {
    if (user && user.uid) {
      setLoadingUser(false);
      fetchPosts(user.uid);
    }
  }, [user]);

  // Create Post
  const handlePost = async () => {
    if (!file) return alert("Select file");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axios.post(`${BASE_URL}/upload`, formData);

      const { mediaUrl, mediaType } = uploadRes.data;

      await axios.post(`${BASE_URL}/create`, {
        userId: user.uid,
        caption,
        mediaUrl,
        mediaType,
      });

      setCaption("");
      setFile(null);

      fetchPosts(user.uid);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error posting");
    } finally {
      setLoading(false);
    }
  };

  // Like
  const handleLike = async (postId: string) => {
    await axios.post(`${BASE_URL}/like/${postId}`, {
      userId: user.uid,
    });
    fetchPosts(user.uid);
  };

  // Comment
  const handleComment = async (postId: string, text: string) => {
    await axios.post(`${BASE_URL}/comment/${postId}`, {
      userId: user.uid,
      text,
    });
    fetchPosts(user.uid);
  };

  if (loadingUser) return <p>Loading user...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Public Space</h1>

      {/* Create Post */}
      <div className="border p-4 mb-6 rounded">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0])} />

        <textarea
          placeholder="Write caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full border mt-2 p-2"
        />

        <button
          onClick={handlePost}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 mt-2"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>

      {/* Feed */}
      {posts.length === 0 && <p>No posts yet</p>}

      {posts.map((post) => (
        <div key={post._id} className="border p-4 mb-4 rounded">
          <p className="font-semibold">{post.userEmail}</p>
          <p>{post.caption}</p>

          {post.mediaType === "image" ? (
            <img src={post.mediaUrl} className="w-full mt-2" />
          ) : (
            <video controls className="w-full mt-2">
              <source src={post.mediaUrl} />
            </video>
          )}

          <button
            onClick={() => handleLike(post._id)}
            className="mt-2 text-blue-500"
          >
            Like ({post.likes.length})
          </button>

          <div className="mt-2">
            {post.comments.map((c: any, i: number) => (
              <p key={i}>
                <b>{c.userEmail}:</b> {c.text}
              </p>
            ))}
          </div>

          <input
            type="text"
            placeholder="Write comment..."
            onKeyDown={(e: any) => {
              if (e.key === "Enter") {
                handleComment(post._id, e.target.value);
                e.target.value = "";
              }
            }}
            className="border w-full mt-2 p-1"
          />
        </div>
      ))}
    </div>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {

  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bookmark, setBookmark] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");

  // ✅ Get session correctly (IMPORTANT FOR VERCEL)
  useEffect(() => {

  
    const getSession = async () => {
      const { data: { session } } =
        await supabase.auth.getSession();

      setUser(session?.user ?? null);

      if (session?.user) {
        fetchBookmark(session.user);
      }
    };

    getSession();

    const { data: listener } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchBookmark(session.user);
        }
      });

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  // ✅ Google Login
  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });
  }

  // ✅ Logout
  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setBookmark([]);
  }

  // ✅ Fetch bookmarks
  async function fetchBookmark(user) {
    const { data, error } = await supabase
      .from("bookmark")
      .select("*")
      .eq("user_id", user.id);

    if (!error) setBookmark(data);
  }

  async function addBookmark(e) {
  e.preventDefault();

  if (!title || !url) {
    alert("Enter Title and URL");
    return;
  }

  if (!user) {
    alert("User not logged in");
    return;
  }

  const { data, error } = await supabase
    .from("bookmark")
    .insert([
      {
        title: title,
        url: url,
        user_id: user.id
      }
    ]);

  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("Bookmark added:", data);
    setTitle("");
    setUrl("");
    fetchBookmark(user);
  }
}

  // ✅ Delete Bookmark
  async function deleteBookmark(id) {
    await supabase
      .from("bookmark")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    fetchBookmark(user);
  }

  function startEdit(b) {
    setEditId(b.id);
    setEditTitle(b.title);
    setEditUrl(b.url);
  }

  // ✅ Update Bookmark
  async function updateBookmark() {
    await supabase
      .from("bookmark")
      .update({
        title: editTitle,
        url: editUrl
      })
      .eq("id", editId)
      .eq("user_id", user.id);

    setEditId(null);
    fetchBookmark(user);
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-[500px]">

        <h1 className="text-2xl font-bold text-center mb-4">
          Smart Bookmark Manager
        </h1>

        {/* ✅ LOGIN SCREEN */}
        {!user && (
          <div className="text-center">
            <button
              onClick={signInWithGoogle}
              className="bg-red-500 text-white px-4 py-2 rounded-lg">
              Login with Google
            </button>
          </div>
        )}

        {/* ✅ APP SCREEN */}
        {user && (
          <>
            <h2 className="text-center mb-4">
              Welcome {user.email}
            </h2>

            <button
              onClick={logout}
              className="bg-gray-800 text-white px-3 py-1 rounded mb-4">
              Logout
            </button>

            <form
              onSubmit={addBookmark}
              className="flex flex-col gap-3 mb-5">

              <input
                className="border p-2 rounded-lg"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                className="border p-2 rounded-lg"
                placeholder="URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />

              <button 
              type="submit"
              className="bg-purple-600 text-white py-2 rounded-lg">
                Add Bookmark
              </button>
            </form>

            <ul className="space-y-3">
              {bookmark.map((b) => (
                <li key={b.id}
                  className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">

                  {editId === b.id ? (
                    <>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="border p-1 rounded"
                      />
                      <input
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="border p-1 rounded"
                      />
                      <button
                        onClick={updateBookmark}
                        className="bg-green-500 text-white px-2 py-1 rounded">
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <a href={b.url}
                         target="_blank"
                         className="text-blue-600 underline">
                        {b.title}
                      </a>

                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(b)}
                          className="bg-yellow-400 px-2 py-1 rounded">
                          Edit
                        </button>
                        <button
                          onClick={() => deleteBookmark(b.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded">
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

      </div>
    </div>
  );
}
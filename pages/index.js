import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {

  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [bookmark, setbookmark] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");

  // 🔹 Get Logged-in User
  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    fetchbookmark(user);
  }

  // 🔹 Fetch bookmark
  async function fetchbookmark(user) {
    if (!user) return;

    const { data, error } = await supabase
      .from("bookmark")
      .select("*")
      .eq("user_id", user.id);

    if (!error) {
      setbookmark(data);
    }
  }

  // 🔹 Add Bookmark
  async function addBookmark(e) {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();

    if (!title || !url) {
      alert("Enter both Title and URL");
      return;
    }

    const { error } = await supabase.from("bookmark").insert([
      {
        title: title,
        url: url,
        user_id: user.id
      }
    ]);

    if (!error) {
      setTitle("");
      setUrl("");
      fetchbookmark(user);
    }
  }

  // 🔹 Delete Bookmark
  async function deleteBookmark(id) {

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("bookmark")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.log(error);
      return;
    }

    fetchbookmark(user);
  }

  function startEdit(bookmark) {
  setEditId(bookmark.id);
  setEditTitle(bookmark.title);
  setEditUrl(bookmark.url);
  }

  // 🔹 Update Bookmark
async function updateBookmark() {

  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("bookmark")
    .update({
      title: editTitle,
      url: editUrl
    })
    .eq("id", editId)
    .eq("user_id", user.id);

  if (error) {
    console.log(error);
    return;
  }

  setEditId(null);
  fetchbookmark(user);
}
 
  return (
  <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">

    <div className="bg-white p-8 rounded-2xl shadow-2xl w-[500px]">

      <h1 className="text-2xl font-bold text-center mb-2">
        Smart Bookmark Manager
      </h1>  

      <h2 className="text-2xl font-bold mb-4 text-center">
        Welcome {user?.email}
      </h2>

      <form onSubmit={addBookmark} className="flex flex-col gap-3 mb-5">

        <input
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Title"
          onChange={(e) => setTitle(e.target.value)}
        />
        <br></br>
        <input
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="URL"
          onChange={(e) => setUrl(e.target.value)}
        />
        <br></br>
        <button
          className="bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
          Add Bookmark
        </button>

      </form>

      <ul className="space-y-3">

        {bookmark?.map((b) => (
          <li key={b.id} className="flex justify-between items-center bg-gray-100 p-3 rounded-lg">

            {editId === b.id ? (
              <>
                <input
                  className="border p-1 rounded"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />

                <input
                  className="border p-1 rounded"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                />

                <button
                  className="bg-green-500 text-white px-2 py-1 rounded"
                  onClick={updateBookmark}>
                  Save
                </button>
              </>
            ) : (
              <>
                <a
                  href={b.url}
                  target="_blank"
                  className="text-blue-600 underline">
                  {b.title}
                </a>

                <div className="flex gap-2">
                  <button
                    className="bg-yellow-400 px-2 py-1 rounded"
                    onClick={() => startEdit(b)}>
                    Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => deleteBookmark(b.id)}>
                    Delete
                  </button>
                </div>
              </>
            )}

          </li>
        ))}

      </ul>

    </div>

  </div>
);
}
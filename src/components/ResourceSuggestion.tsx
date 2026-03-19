"use client";

import { useEffect, useState } from "react";
import { Search, Star, Bookmark, X, Plus } from "lucide-react";

type Video = {
  id: string;
  title: string;
  channel: string;
  url: string;
  views: string;
  rating: number;
  reason: string;
};

export default function YouTubeAIResources() {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [favorites, setFavorites] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [playlistName, setPlaylistName] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* ---------------- LOAD FAVORITES ---------------- */
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/api/favorites", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setFavorites);

    fetch("http://localhost:5000/api/playlists/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setPlaylists);
  }, [token]);

  /* ---------------- FETCH AI VIDEOS ---------------- */
  const fetchVideos = async () => {
    if (!query) return alert("Enter a topic");

    setLoading(true);
    setVideos([]);

    const res = await fetch("http://localhost:5000/api/youtube/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    setVideos(data.videos);
    setLoading(false);
  };

  /* ---------------- FAVORITE ---------------- */
  const toggleFavorite = async (video: Video) => {
    if (!token) return alert("Login first");

    await fetch("http://localhost:5000/api/favorites/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ video }),
    });

    setFavorites((prev) =>
      prev.some((v) => v.id === video.id)
        ? prev.filter((v) => v.id !== video.id)
        : [...prev, video]
    );
  };

  /* ---------------- CREATE PLAYLIST ---------------- */
  const savePlaylist = async () => {
    if (!token) return alert("Login first");
    if (!playlistName) return alert("Enter playlist name");
    if (favorites.length === 0)
      return alert("Add videos to favorites first");

    const res = await fetch("http://localhost:5000/api/playlists/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: playlistName,
        videos: favorites,
      }),
    });

    const data = await res.json();

    alert(
      `Playlist Saved ✅\nShare Link:\nhttp://localhost:3000/playlist/${data._id}`
    );

    setPlaylistName("");
    setShowCreateModal(false);

    // reload playlists
    fetch("http://localhost:5000/api/playlists/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setPlaylists);
  };

  /* ---------------- ADD VIDEO TO EXISTING PLAYLIST ---------------- */
  const addToPlaylist = async (playlistId: string) => {
    if (!token || !selectedVideo) return;

    await fetch(
      `http://localhost:5000/api/playlists/${playlistId}/add-video`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ video: selectedVideo }),
      }
    );

    alert("Video added ✅");
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#111827] to-black text-gray-200 py-24 px-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-extrabold text-center mb-10 bg-gradient-to-r from-red-500 to-yellow-400 bg-clip-text text-transparent">
          YouTube AI Learning Studio
        </h1>

        {/* SEARCH */}
        <div className="flex gap-3 mb-10">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topic..."
            className="flex-1 p-4 rounded-xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-red-500 outline-none"
          />
          <button
            onClick={fetchVideos}
            className="bg-red-500 hover:bg-red-600 px-6 rounded-xl"
          >
            <Search size={18} />
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-yellow-400 text-black px-6 rounded-xl"
          >
            Playlist ({favorites.length})
          </button>
        </div>

        {loading && (
          <p className="text-center text-gray-400">
            🔍 AI analyzing videos...
          </p>
        )}

        {/* VIDEOS */}
        <div className="grid md:grid-cols-2 gap-8">
          {videos.map((v) => (
            <div
              key={v.id}
              className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:shadow-red-500/20 transition"
            >
              <h3 className="text-lg font-semibold mb-2">{v.title}</h3>

              <iframe
                width="100%"
                height="220"
                src={`https://www.youtube.com/embed/${v.id}`}
                className="rounded-xl mb-4"
              ></iframe>

              <div className="flex justify-between items-center">
                <button onClick={() => toggleFavorite(v)}>
                  <Bookmark
                    className={
                      favorites.some((f) => f.id === v.id)
                        ? "text-yellow-400"
                        : "text-gray-400"
                    }
                  />
                </button>

                {token && (
                  <button
                    onClick={() => {
                      setSelectedVideo(v);
                      setShowAddModal(true);
                    }}
                    className="bg-purple-600 px-3 py-1 rounded-lg text-xs hover:bg-purple-700 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE PLAYLIST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center">
          <div className="bg-[#0f172a] p-8 rounded-2xl w-[600px]">
            <button
              onClick={() => setShowCreateModal(false)}
              className="float-right"
            >
              <X />
            </button>

            <h2 className="text-2xl font-bold text-yellow-400 mb-4">
              Create Playlist
            </h2>

            <input
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="Playlist name..."
              className="w-full p-3 mb-4 rounded-xl bg-black/40 border border-yellow-400/30"
            />

            <button
              onClick={savePlaylist}
              className="w-full bg-yellow-400 text-black py-3 rounded-xl"
            >
              Save Playlist
            </button>
          </div>
        </div>
      )}

      {/* ADD TO PLAYLIST MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center">
          <div className="bg-[#0f172a] p-6 rounded-2xl w-[400px]">
            <h2 className="text-xl font-bold text-purple-400 mb-4">
              Select Playlist
            </h2>

            {playlists.map((pl) => (
              <div
                key={pl._id}
                onClick={() => addToPlaylist(pl._id)}
                className="p-3 bg-black/40 rounded-lg mb-3 cursor-pointer hover:bg-purple-600/20"
              >
                {pl.name}
              </div>
            ))}

            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

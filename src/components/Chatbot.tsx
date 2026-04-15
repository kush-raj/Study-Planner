import { useState, useRef, useEffect } from "react";
import { API_URL, isLoggedIn, AUTH_EVENT } from "@/lib/api";

interface Chat {
  message: string;
  reply: string;
}

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for auth changes
  useEffect(() => {
    const handleAuth = () => setLoggedIn(isLoggedIn());
    window.addEventListener(AUTH_EVENT, handleAuth);
    return () => window.removeEventListener(AUTH_EVENT, handleAuth);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, loading]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;

    setChats((prev) => [...prev, { message: userMessage, reply: "" }]);
    setMessage("");
    setLoading(true);

    try {
      if (!loggedIn) {
        setChats((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].reply = "⚠️ Please login first to use the AI assistant.";
          return updated;
        });
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          topic: "study",
          level: "beginner",
        }),
      });

      const data = await res.json();

      setChats((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].reply = data.reply || "⚠️ No response from AI";
        return updated;
      });
    } catch {
      setChats((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].reply = "⚠️ Connection error. Please try again.";
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl z-[1000] shadow-lg transition-all hover:scale-110 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #22d3ee, #6366f1)",
          boxShadow: "0 4px 20px rgba(34, 211, 238, 0.4)",
        }}
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 w-[380px] h-[520px] rounded-2xl flex flex-col overflow-hidden z-[1000] animate-scale-in"
          style={{
            background: "#020617",
            boxShadow: "0 8px 40px rgba(34, 211, 238, 0.15), 0 0 0 1px rgba(34, 211, 238, 0.1)",
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center gap-3"
            style={{ background: "linear-gradient(135deg, #22d3ee, #6366f1)" }}
          >
            <span className="text-xl">🤖</span>
            <div>
              <p className="font-bold text-black text-sm">AI Study Assistant</p>
              <p className="text-black/60 text-xs">Ask anything about your studies</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
            {chats.length === 0 && (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">🎓</p>
                <p className="text-gray-500 text-sm">Ask me any study question!</p>
                <div className="mt-4 space-y-2">
                  {["Explain Newton's laws", "Tips for time management", "How to solve quadratic equations"].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setMessage(q); }}
                      className="block w-full text-left text-xs text-gray-400 bg-gray-800/50 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chats.map((chat, i) => (
              <div key={i} className="space-y-2">
                {/* User */}
                <div className="flex justify-end">
                  <div
                    className="px-4 py-2.5 rounded-2xl rounded-br-sm text-sm font-medium max-w-[80%] text-black"
                    style={{ background: "linear-gradient(135deg, #22d3ee, #6366f1)" }}
                  >
                    {chat.message}
                  </div>
                </div>

                {/* AI */}
                {chat.reply && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm max-w-[85%] text-gray-200 bg-gray-800/50 border border-gray-700/50">
                      {chat.reply}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-gray-800/50 border border-gray-700/50">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-800 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={loggedIn ? "Ask me anything..." : "Login to chat..."}
              disabled={!loggedIn}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50 placeholder-gray-600"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim() || loading}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-black disabled:opacity-50 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #22d3ee, #6366f1)" }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;

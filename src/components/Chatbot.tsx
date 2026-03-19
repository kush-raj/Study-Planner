import { useState } from "react";
import axios from "axios";

interface Chat {
  message: string;
  reply: string;
}

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
  
    const userMessage = message;
  
    // ✅ 1. Add user message instantly with typing
    setChats((prev) => [
      ...prev,
      { message: userMessage, reply: "" }, //🤖 Typing...
    ]);
  
    setMessage("");
    setLoading(true);
  
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "https://study-planner-2-zmn4.onrender.com/api/chat",
        {
          message: userMessage,
          topic: "mern",
          level: "beginner",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // ✅ 2. Backend returns { message, reply }
      const aiReply = res.data.reply;
  
      // ✅ 3. Update LAST chat only
      setChats((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].reply =
          aiReply || "⚠️ No AI response";
        return updated;
      });
    } catch (err: any) {
      console.error("CHAT ERROR:", err?.response?.data || err.message);
  
      // ✅ 4. Update LAST chat with error
      setChats((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].reply =
          "⚠️ You Need to Login First";
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <>
      {/* 🤖 Floating Button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "linear-gradient(135deg,#22d3ee,#6366f1)",
          color: "#000",
          fontSize: "28px",
          border: "none",
          cursor: "pointer",
          animation: "pulse 2s infinite",
          zIndex: 1000,
        }}
      >
        🤖
      </button>

      {/* 💬 Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "110px",
            right: "24px",
            width: "390px",
            height: "560px",
            background: "#020617",
            borderRadius: "20px",
            boxShadow: "0 0 40px rgba(34,211,238,0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg,#22d3ee,#6366f1)",
              padding: "16px",
              color: "#000",
              fontWeight: 700,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            🤖 Your AI Study Assistant
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "rgba(0,0,0,0.2)",
                border: "none",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "14px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {chats.map((chat, i) => (
              <div key={i}>
                {/* User */}
                <div
                  style={{
                    alignSelf: "flex-end",
                    background:
                      "linear-gradient(135deg,#6366f1,#22d3ee)",
                    color: "#000",
                    padding: "12px 14px",
                    borderRadius: "16px 16px 4px 16px",
                    maxWidth: "80%",
                    marginLeft: "auto",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {chat.message}
                </div>

                {/* AI */}
                <div
                  className="typing"
                  style={{
                    alignSelf: "flex-start",
                    background: "#020617",
                    color: "#e5e7eb",
                    padding: "12px 14px",
                    borderRadius: "16px 16px 16px 4px",
                    maxWidth: "80%",
                    marginTop: "6px",
                    fontSize: "14px",
                    border: "1px solid rgba(34,211,238,0.2)",
                  }}
                >
                  {chat.reply}
                </div>
              </div>
            ))}

            {loading && (
              <div
                className="typing"
                style={{
                  color: "#94a3b8",
                  fontSize: "13px",
                }}
              >
                🤖 Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px",
              display: "flex",
              gap: "10px",
              background: "#020617",
              borderTop: "1px solid rgba(34,211,238,0.15)",
            }}
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me anything..."
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid rgba(34,211,238,0.3)",
                background: "#000",
                color: "#fff",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: "0 18px",
                borderRadius: "12px",
                background: "linear-gradient(135deg,#22d3ee,#6366f1)",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
                color: "#000",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>
        {`
          .typing {
            animation: fadeIn 0.4s ease-in-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(34,211,238,0.6); }
            70% { box-shadow: 0 0 0 18px rgba(34,211,238,0); }
            100% { box-shadow: 0 0 0 0 rgba(34,211,238,0); }
          }
        `}
      </style>
    </>
  );
};

export default Chatbot;

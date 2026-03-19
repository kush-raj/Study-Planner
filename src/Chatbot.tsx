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
  const [open, setOpen] = useState(true); // toggle chat

  const sendMessage = async () => {
    if (!message) return;

    setLoading(true);

    const res = await axios.post("https://dark-spark-studio-main.onrender.com/api/chat", {
      message,
      topic: "mern",
      level: "beginner",
    });

    setChats([...chats, res.data]);
    setMessage("");
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          borderRadius: "50%",
          width: "55px",
          height: "55px",
          fontSize: "22px",
          backgroundColor: "#4f46e5",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          zIndex: 1000,
        }}
      >
        🤖
      </button>

      {/* Chat Window */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "360px",
            height: "480px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px",
              backgroundColor: "#4f46e5",
              color: "#fff",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
              fontWeight: "bold",
            }}
          >
            🤖 AI Learning Assistant
          </div>

          {/* Chat Area */}
          <div
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              fontSize: "14px",
            }}
          >
            {chats.map((chat, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <p><b>You:</b> {chat.message}</p>
                <p><b>AI:</b> {chat.reply}</p>
                <hr />
              </div>
            ))}
            {loading && <p>AI is thinking...</p>}
          </div>

          {/* Input */}
          <div style={{ padding: "10px", borderTop: "1px solid #ddd" }}>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything..."
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "8px",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                width: "100%",
                padding: "8px",
                backgroundColor: "#4f46e5",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
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
        
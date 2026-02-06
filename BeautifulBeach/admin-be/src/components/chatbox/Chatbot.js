import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css";

const ROBOT_ICON_URL = "./chat.png";

const Chatbot = () => {
  const N8N_WEBHOOK_URL =
    "https://53eaf35f664c.ngrok-free.app/webhook/dd2cc16b-22c3-403e-a487-3c98dad2c66a";

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Xin chào! Tôi có thể giúp gì cho bạn?",
      sender: "ai",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [sessionId, setSessionId] = useState("");
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    let currentSessionId = localStorage.getItem("chatbotSessionId");
    if (!currentSessionId) {
      currentSessionId =
        "session_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2, 15);
      localStorage.setItem("chatbotSessionId", currentSessionId);
    }
    setSessionId(currentSessionId);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          console.log(
            `Vị trí đã được lấy: ${position.coords.latitude}, ${position.coords.longitude}`
          );
        },
        (error) => {
          console.error("Lỗi khi lấy vị trí: ", error.message);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const toggleChat = () => setIsOpen(!isOpen);
  const handleSendMessage = async () => {
    const messageText = inputValue.trim();
    if (messageText === "") return;

    setMessages((prev) => [...prev, { text: messageText, sender: "user" }]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          message: messageText,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        }),
      });

      if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);

      const data = await response.json();

      if (data.reply) {
        const formattedReply = data.reply.replace(/\\n/g, "\n");
        setMessages((prev) => [
          ...prev,
          { text: formattedReply, sender: "ai" },
        ]);
      } else {
        throw new Error("Phản hồi không hợp lệ từ server.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      setMessages((prev) => [
        ...prev,
        { text: `Đã xảy ra lỗi: ${error.message}.`, sender: "ai" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Render component
  return (
    <div className="chatbot-widget">
      {isOpen ? (
        <div className="chat-container open">
          <div className="chat-header">
            <h3>SeaTalk</h3>
            <button onClick={toggleChat} className="close-btn">
              -
            </button>
          </div>
          <div className="chat-messages" ref={chatMessagesRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}-message`}>
                {/* Dùng CSS để xử lý xuống dòng cho đẹp */}
                <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
              </div>
            ))}
            {isTyping && <div className="message typing-indicator">...</div>}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Nhập tin nhắn..."
            />
            <button onClick={handleSendMessage}>→</button>
          </div>
        </div>
      ) : (
        <div className="chat-bubble" onClick={toggleChat}>
          <img src={ROBOT_ICON_URL} alt="Chatbot Icon" />
        </div>
      )}
    </div>
  );
};

export default Chatbot;

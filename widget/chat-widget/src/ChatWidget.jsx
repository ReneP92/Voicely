import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquare, X } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const ChatWidget = ({ storeId }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [online, setOnline] = useState(false);
  const messagesEndRef = useRef(null);

  const userId = getOrCreateUserId();

  function getOrCreateUserId() {
    const localId = localStorage.getItem("chat_user_id");
    if (localId) return localId;
    const newId = uuidv4();
    localStorage.setItem("chat_user_id", newId);
    return newId;
  }

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";
    const newSocket = io(socketUrl, {
      query: { storeId, userId },
    });

    newSocket.on("connect", () => setOnline(true));
    newSocket.on("disconnect", () => setOnline(false));

    newSocket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on("typing", () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1500);
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [storeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() && socket) {
      const message = { text: input, from: userId, storeId };
      socket.emit("message", message);
      setInput("");
    }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (socket) socket.emit("typing", { from: userId, storeId });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 z-50 flex items-center justify-center"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chatbox"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-[84px] right-5 w-80 z-50"
          >
            <Card className="rounded-2xl shadow-xl flex flex-col">
              <CardContent className="p-4 flex flex-col space-y-3 h-full">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">💬 Support Chat</div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      online ? "bg-green-500" : "bg-gray-400"
                    }`}
                    title={online ? "Online" : "Offline"}
                  />
                </div>

                <div className="overflow-y-auto max-h-64 pr-1 space-y-2">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                        msg.from === userId
                          ? "ml-auto bg-blue-500 text-white"
                          : "mr-auto bg-gray-100 text-gray-900"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="text-sm text-gray-500 italic">
                      Support is typing...
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="flex gap-2 pt-2">
                  <Input
                    value={input}
                    onChange={handleTyping}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button onClick={sendMessage}>Send</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
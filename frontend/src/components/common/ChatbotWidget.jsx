import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { CHATBOT_SYSTEM_PROMPT } from '../../utils/chatbotContext';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý ảo BlueMoon AI. Bạn cần hỗ trợ gì về việc quản lý chung cư?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const newUserMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Sử dụng API key từ environment variables (cần tạo file .env trong frontend)
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Không tìm thấy VITE_GEMINI_API_KEY. Vui lòng thêm vào file .env");
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: userText }]
          }],
          systemInstruction: {
            parts: [{ text: CHATBOT_SYSTEM_PROMPT }]
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi không thể tạo câu trả lời lúc này.";

      const newAiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newAiMsg]);

    } catch (error) {
      console.error("Gemini API Error:", error);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "Xin lỗi, đã có lỗi kết nối tới máy chủ AI. Vui lòng kiểm tra lại API Key hoặc thử lại sau.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div
          className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 transition-all duration-300 ease-in-out transform origin-bottom-right"
          style={{
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1), 0 0 20px -5px rgba(0,0,0,0.05)',
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between shadow-md relative z-10">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold flex items-center gap-1">
                  BlueMoon AI <Sparkles className="w-4 h-4 text-yellow-300" />
                </h3>
                <p className="text-blue-100 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"></span>
                  Trực tuyến
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" style={{ scrollbarWidth: 'thin' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              >
                <div className={`flex max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>

                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl ${msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm shadow-sm'
                        : 'bg-white text-gray-700 rounded-bl-sm border border-gray-100 shadow-sm'
                        }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 mx-1">{msg.time}</span>
                  </div>

                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="flex flex-row items-end gap-2 max-w-[80%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm flex space-x-1.5 items-center h-[44px]">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent block w-full px-4 py-2.5 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`p-2.5 rounded-full flex items-center justify-center transition-all ${inputValue.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[10px] text-gray-400">Powered by BlueMoon Tech</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          } absolute bottom-0 right-0 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 z-10 flex items-center justify-center`}
      >
        <MessageCircle className="w-6 h-6 animate-pulse" />
      </button>

      {/* Close Floating Button Transition (Optional: you can just use X inside the window, but adding a nice effect here if they want to click same spot to close) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${!isOpen ? '-rotate-90 scale-0 opacity-0 pointer-events-none' : 'rotate-0 scale-100 opacity-100'
          } absolute bottom-0 right-0 p-4 bg-gray-800 text-white rounded-full shadow-xl hover:shadow-2xl hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1 z-10 flex items-center justify-center`}
      >
        <X className="w-6 h-6" />
      </button>

    </div>
  );
};

export default ChatbotWidget;

import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiMaximize, FiMinimize, FiMessageSquare } from 'react-icons/fi';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentStreamedMessage, setCurrentStreamedMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamedMessage]);

  const toggleChat = async () => {
    if (!isOpen) {
      try {
        const response = await fetch('http://localhost:3001/api/chat/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to start chat');
        setIsOpen(true);
      } catch (error) {
        console.error('Error starting chat:', error);
      }
    } else {
      try {
        await fetch('http://localhost:3001/api/chat/end', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error ending chat:', error);
      }
      setIsOpen(false);
      setMessages([]);
      setIsFullScreen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setInputMessage('');
    setIsTyping(true);
    setCurrentStreamedMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '' || !line.startsWith('data:')) continue;

          const jsonStr = line.slice(5);
          try {
            const data = JSON.parse(jsonStr);
            if (data.text) {
              setCurrentStreamedMessage(prev => prev + data.text);
            } else if (data === '[DONE]') {
              setMessages(prev => [...prev, { text: currentStreamedMessage, isUser: false }]);
              setCurrentStreamedMessage('');
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { text: 'Error: Failed to get response', isUser: false }]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const chatContainerClass = `
    ${isFullScreen ? 'fixed inset-0 w-full h-full' : 'w-96 h-[600px]'}
    bg-chat-bg rounded-lg shadow-chat flex flex-col transition-all duration-300 ease-in-out
  `;

  return (
    <div className={`fixed z-50 ${isFullScreen ? 'inset-0' : 'bottom-4 right-4'}`}>
      {isOpen ? (
        <div className={chatContainerClass}>
          <div className="bg-chat-header text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <h3 className="font-medium text-lg flex-1 text-center">M-IA Assistant</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleFullScreen}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isFullScreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
              </button>
              <button
                onClick={toggleChat}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] p-3 rounded-2xl
                    ${message.isUser
                      ? 'bg-primary text-white'
                      : 'bg-chat-input text-gray-800'
                    }
                  `}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {currentStreamedMessage && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-2xl bg-chat-input text-gray-800">
                  {currentStreamedMessage}
                </div>
              </div>
            )}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-2xl bg-chat-input">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-3 rounded-xl bg-chat-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={isTyping || !inputMessage.trim()}
                className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
              >
                <FiSend size={20} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          className="p-4 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg transition-colors"
        >
          <FiMessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

export default Chatbot;

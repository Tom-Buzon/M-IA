import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiMaximize, FiMinimize, FiMessageSquare } from 'react-icons/fi';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentStreamedMessage, setCurrentStreamedMessage] = useState('');
  const [modelName, setModelName] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Charger le nom du modèle au démarrage
    fetch('http://localhost:3001/api/model')
      .then(response => response.json())
      .then(data => setModelName(data.model))
      .catch(error => console.error('Error fetching model name:', error));

    // Initialiser le chat
    fetch('http://localhost:3001/api/chat/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ force: true })
    })
    .catch(error => console.error('Error initializing chat:', error));

    // Nettoyer l'état du chat lors du démontage du composant
    return () => {
      fetch('http://localhost:3001/api/chat/reset', {
        method: 'POST',
      }).catch(error => console.error('Error resetting chat:', error));
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentStreamedMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
        const data = await response.json();
        setIsOpen(true);
      } catch (error) {
        console.error('Error starting chat:', error);
      }
    } else {
      setIsOpen(false);
      setMessages([]);
      setIsFullScreen(false);
      
      // Réinitialiser l'état du chat
      try {
        await fetch('http://localhost:3001/api/chat/reset', {
          method: 'POST',
        });
      } catch (error) {
        console.error('Error resetting chat:', error);
      }
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
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
      let fullMessage = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '' || !line.startsWith('data:')) continue;

          const jsonStr = line.slice(5).trim();
          
          if (jsonStr === '[DONE]') {
            setMessages(prev => [...prev, { text: fullMessage, isUser: false }]);
            setCurrentStreamedMessage('');
            setIsTyping(false);
            continue;
          }

          try {
            const data = JSON.parse(jsonStr);
            if (data.text) {
              fullMessage += data.text;
              setCurrentStreamedMessage(fullMessage);
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className={`fixed z-50 ${isFullScreen ? 'inset-0' : 'bottom-4 right-4'}`}>
      {isOpen && (
        <div className={`fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl overflow-hidden ${
          isFullScreen ? 'fixed inset-0 w-full h-full z-50' : 'z-40'
        }`}>
          <div className="flex justify-between items-center p-4 bg-gray-700 text-white">
            <div className="flex items-center space-x-2">
              <FiMessageSquare className="text-xl" />
              <span className="font-semibold">M-IA Assistant {modelName && `(${modelName})`}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="text-white hover:text-gray-300 focus:outline-none"
              >
                {isFullScreen ? <FiMinimize /> : <FiMaximize />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-300 focus:outline-none"
              >
                <FiX />
              </button>
            </div>
          </div>

          <div 
            className={`overflow-y-auto bg-gray-50 ${isFullScreen ? 'h-[calc(100vh-120px)]' : 'h-96'}`}
            style={{ zIndex: 50 }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-4 ${message.isUser ? 'bg-gray-50' : 'bg-white'}`}
              >
                <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="p-4">
                <div className="flex justify-start">
                  <div className="max-w-[80%] bg-gray-200 rounded-lg p-3 text-gray-800">
                    {currentStreamedMessage ? (
                      <p className="whitespace-pre-wrap">{currentStreamedMessage}</p>
                    ) : (
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100" style={{ zIndex: 51 }}>
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                e.stopPropagation();
                handleSendMessage(); 
              }} 
              className="flex space-x-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="flex-grow p-2 border rounded-l focus:outline-none focus:border-blue-500 bg-gray-50 text-gray-900"
                style={{ zIndex: 52 }}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 focus:outline-none transition-colors duration-200"
                style={{ zIndex: 52 }}
              >
                <FiSend />
              </button>
            </form>
          </div>
        </div>
      )}
      {!isOpen && (
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

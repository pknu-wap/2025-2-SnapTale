import { useState, useEffect, useRef } from 'react';
import './ChatBox.css';

const ChatBox = ({ isOpen, onClose, messages, onSendMessage, nickname }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log('📋 ChatBox - 메시지 업데이트:', messages);
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      console.log('💬 ChatBox - 메시지 전송 시도:', inputMessage);
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-box">
      <div className="chat-header">
        <span>채팅</span>
        <button className="chat-close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`chat-message ${msg.nickname === nickname ? 'my-message' : 'other-message'}`}
          >
            <div className="message-nickname">{msg.nickname}</div>
            <div className="message-content">{msg.message}</div>
            <div className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요..."
        />
        <button className="chat-send-btn" onClick={handleSend}>
          전송
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
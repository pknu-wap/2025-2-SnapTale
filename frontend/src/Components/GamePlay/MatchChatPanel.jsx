import { useCallback } from "react";
import "./MatchChatPanel.css";

const formatTime = (value) => {
  if (!value) return "";
  try {
    const date = new Date(value);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const MatchChatPanel = ({
  isOpen,
  onToggle,
  messages,
  draft,
  onDraftChange,
  onSend,
  disabled,
  connected,
  error
}) => {
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    onSend();
  }, [onSend]);

  return (
    <div className="match-chat">
      <button
        type="button"
        className="match-chat__fab"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="match-chat-panel"
      >
        💬
        <span className="match-chat__status" aria-hidden="true">
          {connected ? "●" : "○"}
        </span>
      </button>
      {isOpen && (
        <div className="match-chat__panel" id="match-chat-panel">
          <div className="match-chat__header">
            <span>방 채팅</span>
            <span className={`match-chat__connection ${connected ? "is-online" : "is-offline"}`}>
              {connected ? "온라인" : "오프라인"}
            </span>
          </div>
          <div className="match-chat__body">
            {messages.length === 0 ? (
              <div className="match-chat__empty">메시지가 없습니다.</div>
            ) : (
              messages.map((chat) => (
                <div key={chat.id} className="match-chat__message">
                  <span className="match-chat__nickname">{chat.senderNickname}</span>
                  <span className="match-chat__content">{chat.content}</span>
                  <span className="match-chat__time">{formatTime(chat.sentAt)}</span>
                </div>
              ))
            )}
          </div>
          {error && <div className="match-chat__error">{error}</div>}
          <form className="match-chat__form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder="메시지를 입력하세요"
              maxLength={200}
            />
            <button type="submit" disabled={disabled || !draft.trim()}>
              전송
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MatchChatPanel;
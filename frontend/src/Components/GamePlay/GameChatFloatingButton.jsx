import { useEffect, useMemo, useRef, useState } from "react";
import { useWebSocket } from "../../contexts/WebSocketContext.jsx";
import { useUser } from "../../contexts/UserContext.jsx";
import "./GameChat.css";

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "";
  }

  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function GameChatFloatingButton({ matchId }) {
  const { messages, isConnected, error, subscribe, sendMessage } = useWebSocket();
  const { user } = useUser();

  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");

  const listEndRef = useRef(null);
  const subscriptionRef = useRef(null);

  const destination = useMemo(() => `/topic/match/${matchId}/chat`, [matchId]);

  useEffect(() => {
    if (!matchId) {
      return undefined;
    }

    if (!isConnected) {
      return undefined;
    }

    subscriptionRef.current = subscribe(destination, {
      key: destination,
    });

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, [destination, isConnected, matchId, subscribe]);

  const chatMessages = useMemo(() => {
    return messages
      .filter((entry) => entry.destination === destination)
      .map((entry) => {
        const payload = entry.body;
        const chatPayload = payload?.data ?? payload;

        if (!chatPayload) {
          return null;
        }

        const content = chatPayload.content ?? payload?.message ?? "";

        if (!content) {
          return null;
        }

        return {
          id: `${entry.receivedAt}-${chatPayload.senderId ?? "system"}`,
          senderNickname: chatPayload.senderNickname ?? "시스템",
          content,
          sentAt: chatPayload.sentAt ?? payload?.timestamp,
          isOwn: Boolean(user?.guestId) && chatPayload.senderId === user.guestId,
        };
      })
      .filter(Boolean);
  }, [destination, messages, user?.guestId]);

  useEffect(() => {
    if (listEndRef.current) {
      listEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages.length, isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!draft.trim()) {
      setStatus("메시지를 입력해주세요.");
      return;
    }

    if (!user?.guestId) {
      setStatus("게스트 등록 후 채팅을 이용할 수 있습니다.");
      return;
    }

    if (!isConnected) {
      setStatus("연결을 확인하는 중입니다. 잠시 후 다시 시도하세요.");
      return;
    }

    try {
      sendMessage(`/app/match/${matchId}/chat`, {
        matchId: Number(matchId),
        senderId: user.guestId,
        senderNickname: user.nickname,
        content: draft.trim(),
      });
      setDraft("");
      setStatus("");
    } catch (sendError) {
      console.error("채팅 전송 실패", sendError);
      setStatus("채팅 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="chat-floating-wrapper">
      {isOpen && (
        <div className="chat-floating-panel">
          <header className="chat-panel-header">
            <div>
              <h2>매치 채팅</h2>
              <span className={isConnected ? "chat-status-connected" : "chat-status-disconnected"}>
                {isConnected ? "연결됨" : "연결 대기"}
              </span>
            </div>
            <button
              type="button"
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </header>

          <div className="chat-panel-body">
            <ul className="chat-message-list">
              {chatMessages.length === 0 && (
                <li className="chat-empty">아직 채팅이 없습니다. 첫 메시지를 보내보세요!</li>
              )}
              {chatMessages.map((message) => (
                <li
                  key={message.id}
                  className={message.isOwn ? "chat-message own" : "chat-message"}
                >
                  <div className="chat-meta">
                    <span className="chat-sender">{message.senderNickname}</span>
                    <span className="chat-time">{formatTimestamp(message.sentAt)}</span>
                  </div>
                  <p className="chat-content">{message.content}</p>
                </li>
              ))}
              <li ref={listEndRef} />
            </ul>
          </div>

          <footer className="chat-panel-footer">
            {status && <div className="chat-status-message">{status}</div>}
            {error && <div className="chat-error">{error}</div>}
            <form className="chat-input-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder={isConnected ? "메시지를 입력하세요" : "연결 중입니다..."}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={!isConnected}
              />
              <button type="submit" disabled={!isConnected}>전송</button>
            </form>
          </footer>
        </div>
      )}

      <button
        type="button"
        className="chat-floating-button"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="chat-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path
              d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm0 14H5.17L4 17.17V4h16z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className="chat-label">채팅</span>
      </button>
    </div>
  );
}
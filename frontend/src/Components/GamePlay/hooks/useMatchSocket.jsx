import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useCallback, useEffect, useRef, useState } from "react";

const WS_BASE = `${import.meta.env.VITE_API_BASE ?? ""}/ws-stomp`;

/**
 * 매치별 STOMP 구독을 관리하는 커스텀 훅입니다.
 */
export default function useMatchSocket(matchId, {
  onMessage,
  onConnect,
  onDisconnect
} = {}) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);
  const messageHandlerRef = useRef(onMessage);
  const connectHandlerRef = useRef(onConnect);
  const disconnectHandlerRef = useRef(onDisconnect);

  useEffect(() => {
    messageHandlerRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    connectHandlerRef.current = onConnect;
  }, [onConnect]);

  useEffect(() => {
    disconnectHandlerRef.current = onDisconnect;
  }, [onDisconnect]);

  useEffect(() => {
    if (!matchId) {
      return undefined;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_BASE),
      reconnectDelay: 5000,
      debug: () => {},
    });

    client.onConnect = (frame) => {
      setConnected(true);
      setError(null);

      if (connectHandlerRef.current) {
        connectHandlerRef.current(frame);
      }

      subscriptionRef.current = client.subscribe(`/topic/match/${matchId}`, (message) => {
        try {
          const parsed = JSON.parse(message.body);
          if (messageHandlerRef.current) {
            messageHandlerRef.current(parsed);
          }
        } catch (err) {
          console.error("메시지 파싱 실패", err);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error("STOMP 오류", frame);
      setError(frame.headers?.message || "STOMP error");
    };

    client.onWebSocketError = (event) => {
      console.error("WebSocket 오류", event);
      setError(event?.message || "WebSocket error");
    };

    client.onDisconnect = (frame) => {
      setConnected(false);
      if (disconnectHandlerRef.current) {
        disconnectHandlerRef.current(frame);
      }
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }

      setConnected(false);
    };
  }, [matchId]);

  const send = useCallback((destination, body) => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      throw new Error("WebSocket 연결이 활성화되지 않았습니다.");
    }

    const payload = typeof body === "string" ? body : JSON.stringify(body);
    client.publish({ destination, body: payload });
  }, []);

  return {
    connected,
    error,
    send,
  };
}
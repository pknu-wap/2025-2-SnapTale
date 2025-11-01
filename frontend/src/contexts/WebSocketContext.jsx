import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Outlet } from "react-router-dom";

function resolveWebSocketBaseUrl() {
  let base = import.meta.env.VITE_WS_BASE ?? import.meta.env.VITE_API_BASE ?? null;

  if (!base && typeof window !== "undefined" && window.location) {
    base = `${window.location.protocol}//${window.location.host}`;
  }

  if (!base) {
    return null;
  }

  if (!/^wss?:\/\//i.test(base)) {
    base = base.replace(/^http/i, "ws");
  }

  // Nginx와 Spring Boot에 설정된 엔드포인트인 '/ws-stomp'로 변경합니다.
  return `${base.replace(/\/$/, "")}/ws-stomp`;
}

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const clientRef = useRef(null);
  const subscriptionsRef = useRef(new Map());

  const createSubscription = useCallback((key) => {
    const client = clientRef.current;
    const record = subscriptionsRef.current.get(key);

    if (!client || !client.connected || !record) {
      return;
    }

    if (record.stompSubscription) {
      try {
        record.stompSubscription.unsubscribe();
      } catch (unsubscribeError) {
        console.error("구독 해제 실패:", unsubscribeError);
      }
      record.stompSubscription = null;
    }

    const subscription = client.subscribe(
      record.destination,
      (message) => {
        let parsedBody;
        try {
          parsedBody = JSON.parse(message.body ?? "{}");
        } catch {
          parsedBody = message.body;
        }

        const entry = {
          destination: record.destination,
          subscriptionId: message.headers?.subscription ?? subscription.id,
          headers: message.headers,
          body: parsedBody,
          receivedAt: Date.now(),
        };

        setMessages((prev) => [...prev, entry]);

        const latestRecord = subscriptionsRef.current.get(key);
        if (!latestRecord) {
          return;
        }

        latestRecord.listeners.forEach((listener) => {
          try {
            listener(entry);
          } catch (listenerError) {
            console.error("채팅 메시지 리스너 처리 오류", listenerError);
          }
        });
      },
      record.headers,
    );

    record.stompSubscription = subscription;
    record.subscriptionId = subscription.id;
    subscriptionsRef.current.set(key, record);
  }, []);

  useEffect(() => {
    const brokerURL = resolveWebSocketBaseUrl();

    if (!brokerURL) {
      setError("WebSocket endpoint가 설정되지 않았습니다.");
      return undefined;
    }

    const client = new Client({
    webSocketFactory: () => new SockJS(
    // SockJS는 http/https 스킴을 사용
    // 항상 /ws-stomp 로 연결하면 하위에서 /ws-stomp/** 로 negotiate 됩니다.
    brokerURL.replace(/^wss:/i, "https:").replace(/^ws:/i, "http:")
    ),
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    });

    client.debug = () => {};

    client.onConnect = () => {
      setIsConnected(true);
      setError(null);

      subscriptionsRef.current.forEach((_, key) => {
        createSubscription(key);
      });
    };

    client.onDisconnect = () => {
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      setError(frame?.body || frame?.headers?.message || "WebSocket 오류가 발생했습니다.");
    };

    client.onWebSocketError = () => {
      setError("WebSocket 연결 중 오류가 발생했습니다.");
    };

    client.onWebSocketClose = () => {
      setIsConnected(false);
    };

    clientRef.current = client;
    client.activate();

    const subscriptions = subscriptionsRef.current;

    return () => {
      subscriptions.forEach((record) => {
        try {
          record.stompSubscription?.unsubscribe();
        } catch (unsubscribeError) {
          console.error("구독 해제 실패:", unsubscribeError);
        }
      });
      subscriptions.clear();

      client.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [createSubscription]);

  const subscribe = useCallback((destination, options = {}) => {
    const key = options.key ?? destination;
    const headers = options.headers ?? {};
    const onMessage = options.onMessage;

    let record = subscriptionsRef.current.get(key);
    if (!record) {
      record = {
        destination,
        headers,
        listeners: new Set(),
        stompSubscription: null,
        subscriptionId: null,
      };
    } else {
      record.destination = destination;
      record.headers = headers;
    }

    if (onMessage) {
      record.listeners.add(onMessage);
    }

    subscriptionsRef.current.set(key, record);

    if (clientRef.current?.connected) {
      createSubscription(key);
    }

    return () => {
      const currentRecord = subscriptionsRef.current.get(key);
      if (!currentRecord) {
        return;
      }

      if (onMessage) {
        currentRecord.listeners.delete(onMessage);
      }

      if (currentRecord.listeners.size === 0) {
        try {
          currentRecord.stompSubscription?.unsubscribe();
        } catch (unsubscribeError) {
          console.error("구독 해제 실패:", unsubscribeError);
        }
        subscriptionsRef.current.delete(key);
      } else {
        subscriptionsRef.current.set(key, currentRecord);
      }
    };
  }, [createSubscription]);

  const sendMessage = useCallback((destination, payload, headers = {}) => {
    const client = clientRef.current;

    if (!client || !client.connected) {
      throw new Error("WebSocket 연결이 활성화되어 있지 않습니다.");
    }

    const body = typeof payload === "string" ? payload : JSON.stringify(payload);
    const mergedHeaders = { ...headers };

    if (!mergedHeaders["content-type"]) {
      mergedHeaders["content-type"] = "application/json";
    }

    client.publish({
      destination,
      body,
      headers: mergedHeaders,
    });
  }, []);

  const value = useMemo(
    () => ({
      messages,
      isConnected,
      error,
      subscribe,
      sendMessage,
    }),
    [messages, isConnected, error, subscribe, sendMessage],
  );

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket 훅은 WebSocketProvider 안에서만 사용 가능합니다.");
  }
  return context;
}

export function WebSocketLayout() {
  return (
    <WebSocketProvider>
      <Outlet />
    </WebSocketProvider>
  );
}

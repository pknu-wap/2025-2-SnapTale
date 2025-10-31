import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
console.log('WebSocket API_BASE:', API_BASE);

export class WebSocketClient {
  constructor(matchId, userId, nickname) {
    this.matchId = matchId;
    this.userId = userId;
    this.nickname = nickname;
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = [];
  }

  connect(onConnected, onError) {
    const wsUrl = `${API_BASE}/ws-stomp`;
    console.log('=== WebSocket 연결 시작 ===');

    
    this.stompClient = new Client({
      webSocketFactory: () => {
        console.log('SockJS 인스턴스 생성 중...');
        const sock = new SockJS(wsUrl);
        console.log('SockJS 인스턴스 생성 완료'); //잘 됨
        return sock;
      },
      
      connectHeaders: {},
      
      debug: (str) => {
        console.log('[STOMP]', str); //세션 끊김
      },
      
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log('=== WebSocket 연결 성공! ===');
        console.log('구독 경로:', `/topic/match/${this.matchId}`);
        console.log('발행 경로:', `/app/match/${this.matchId}/chat`);
        this.connected = true;
        if (onConnected) onConnected();
      },
      
      onStompError: (frame) => {
        console.error('=== STOMP 오류 ===');
        console.error('frame:', frame);
        this.connected = false;
        if (onError) onError(frame);
      },
      
      onWebSocketError: (error) => {
        console.error('=== WebSocket 오류 ===');
        console.error('error:', error);
        this.connected = false;
        if (onError) onError(error);
      },
      
      onWebSocketClose: (event) => {
        console.warn('=== WebSocket 연결 종료 ===');
        console.warn('code:', event.code);
        console.warn('reason:', event.reason);
        this.connected = false;
      },
    });

    console.log('STOMP 클라이언트 활성화 시작...');
    this.stompClient.activate();
  }

  disconnect() {
    if (this.stompClient) {
      this.subscriptions.forEach(sub => sub.unsubscribe());
      this.subscriptions = [];
      this.stompClient.deactivate();
      console.log('WebSocket 연결 해제');
      this.connected = false;
    }
  }

  subscribeToMatch(onMessage) {
    if (!this.stompClient) {
      console.error('WebSocket 클라이언트가 없습니다');
      return;
    }

    if (!this.stompClient.connected) {
      console.warn('WebSocket이 아직 연결되지 않았습니다. 연결 후 구독합니다.');
      // 연결될 때까지 대기
      const checkConnection = setInterval(() => {
        if (this.stompClient.connected) {
          clearInterval(checkConnection);
          this.doSubscribe(onMessage);
        }
      }, 100);
      return;
    }

    this.doSubscribe(onMessage);
  }

  doSubscribe(onMessage) {
    const topicPath = `/topic/match/${this.matchId}`;
    console.log('📡 구독 시작:', topicPath);
    
    const subscription = this.stompClient.subscribe(
      topicPath,
      (message) => {
        try {
          console.log('원시 메시지 수신:', message.body);
          const response = JSON.parse(message.body);
          console.log('파싱된 메시지:', response);
          console.log('success:', response.success);
          console.log('message:', response.message);
          console.log('data:', response.data);
          console.log('timestamp:', response.timestamp);
          if (onMessage) onMessage(response);
        } catch (error) {
          console.error('메시지 파싱 실패:', error, '원본:', message.body);
        }
      }
    );

    this.subscriptions.push(subscription);
    console.log('구독 완료:', topicPath);
  }

  sendChatMessage(message) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('WebSocket이 연결되지 않았습니다');
      return;
    }

    const chatMessage = {
      userId: this.userId,
      nickname: this.nickname,
      message: message,
    };

    const destination = `/app/match/${this.matchId}/chat`;
    console.log('💬 채팅 메시지 전송:', destination);
    console.log('메시지 내용:', chatMessage);

    this.stompClient.publish({
      destination: destination,
      body: JSON.stringify(chatMessage),
    });
    
    console.log('메시지 전송 완료');
  }
}


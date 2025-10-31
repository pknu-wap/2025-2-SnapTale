// src/Components/GamePlay/GameLayout.jsx
import { useState, useEffect, useRef } from "react";
import "./GameLayout.css";
import Card from "./Card";
import Location from "./Location";
import Energy from "./Energy";
import EnlargedCard from "./EnlargedCard";

import ChatBox from "./ChatBox";
import DCI from "../../assets/defaultCardImg.svg";
import { WebSocketClient } from "../../utils/websocket";
import { useUser } from "../../contexts/UserContext";
import defaultImg from "../../assets/koreaIcon.png";
import { fetchLocations } from "./api/location";
export default function GameLayout({ matchId }) {
  const lanes = 3;                 // 왼/중/오
  const topCountPerLane = 4;       // 위 4장
  const botCountPerLane = 4;       // 아래 4장
  const handCount = 12;            // 6x2
  const [selectedCard, setSelectedCard] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useUser();
  const wsClient = useRef(null);
  const isChatOpenRef = useRef(false); // 최신 isChatOpen 값을 추적

  // WebSocket 연결
  useEffect(() => {
    if (!matchId || !user) {
      console.warn("⚠️ matchId 또는 user가 없습니다:", { matchId, user });
      return;
    }

    console.log("🔌 GameLayout - WebSocket 연결 시작");
    console.log("matchId:", matchId);
    console.log("user:", user);

    wsClient.current = new WebSocketClient(matchId, user.guestId, user.nickname);
    
    wsClient.current.connect(
      () => {
        console.log("✅ GameLayout - WebSocket 연결 성공!");
        wsClient.current.subscribeToMatch((response) => {
          console.log("🎯 GameLayout - 메시지 수신:", response);
          console.log("success:", response.success);
          console.log("message:", response.message);
          console.log("data:", response.data);
          
          if (response.message === "CHAT" && response.data) {
            console.log("💬 채팅 메시지 감지:", response.data);
            const newMessage = response.data;
            setChatMessages(prev => {
              console.log("이전 메시지:", prev);
              console.log("새 메시지 추가:", newMessage);
              return [...prev, newMessage];
            });
            
            // 채팅창이 닫혀있고, 내가 보낸 메시지가 아니면 읽지 않은 메시지 카운트 증가
            if (!isChatOpenRef.current && newMessage.nickname !== user.nickname) {
              setUnreadCount(prev => prev + 1);
            }
          } else {
            console.log("⚠️ CHAT 타입이 아니거나 데이터 없음:", response);
          }
        });
      },
      (error) => {
        console.error("❌ GameLayout - WebSocket 연결 실패:", error);
      }
    );

    return () => {
      console.log("🔌 GameLayout - WebSocket 연결 해제 (컴포넌트 언마운트)");
      if (wsClient.current) {
        wsClient.current.disconnect();
      }
    };
  }, [matchId, user]); // isChatOpen 제거!

  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
  }, [isChatOpen]);


  const handleSendMessage = (message) => {
    if (wsClient.current) {
      wsClient.current.sendChatMessage(message);
    }
  };

  const handleToggleChat = () => {
    setIsChatOpen(prev => {
      const newValue = !prev;
      isChatOpenRef.current = newValue; // ref 업데이트
      if (newValue) {
        // 채팅창을 열 때 읽지 않은 메시지 카운트 초기화
        setUnreadCount(0);
      }
      return newValue;
    });
  };

  const handleCardClick = (cardData) => {
    setSelectedCard(cardData);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  // 샘플 카드 데이터 12장 (임의 생성)
  const sampleCards = Array.from({ length: handCount }).map((_, i) => ({
    cardId: `card-${i}`,
    name: `Card ${i + 1}`,
    imageUrl: DCI,
    cost: Math.floor(Math.random() * 10) + 1,    // 1~10 랜덤
    power: Math.floor(Math.random() * 10) + 1,   // 1~10 랜덤
    faction: ["korea", "china", "japan"][i % 3], // 번갈아 korea, china, japan
    effectDesc: "Sample effect description",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  return (
    <>
    <div className="gl-wrap">
      {/* 위 3레인 × 4장 */}
      <section className="gl-lanes3">
        {Array.from({ length: lanes }).map((_, laneIdx) => (
          <div className="gl-laneCol" key={`top-${laneIdx}`}>
            {Array.from({ length: topCountPerLane }).map((__, i) => (
              <div className="gl-card" key={`t-${laneIdx}-${i}`} />
            ))}
          </div>
        ))}
      </section>

      {/* 중앙 정육각 3개 */}
      <section className="gl-hexRow">
        {loading && <div className="loading">위치 불러오는 중...</div>}
        {error && <div className="error">⚠ {error}</div>}
        {!loading && !error && locations.length === 3 && (
        <>
          <Location
            key={locations[0].locationId}
            locationId={locations[0].locationId}
            name={locations[0].name}
            imageUrl={locations[0].imageUrl}
            effectDesc={locations[0].effectDesc}
            active={locations[0].active}
            opponentPower={opponentPowers[0]}
            myPower={myPowers[0]}
            onLocationClick={() =>
              alert(`${locations[0].name} 클릭됨! (효과: ${locations[0].effectDesc})`)
            }
          />

          <Location
            key={locations[1].locationId}
            locationId={locations[1].locationId}
            name={locations[1].name}
            imageUrl={locations[1].imageUrl}
            effectDesc={locations[1].effectDesc}
            active={locations[1].active}
            opponentPower={opponentPowers[1]}
            myPower={myPowers[1]}
            onLocationClick={() =>
              alert(`${locations[1].name} 클릭됨! (효과: ${locations[1].effectDesc})`)
            }
          />

          <Location
            key={locations[2].locationId}
            locationId={locations[2].locationId}
            name={locations[2].name}
            imageUrl={locations[2].imageUrl}
            effectDesc={locations[2].effectDesc}
            active={locations[2].active}
            opponentPower={opponentPowers[2]}
            myPower={myPowers[2]}
            onLocationClick={() =>
              alert(`${locations[2].name} 클릭됨! (효과: ${locations[2].effectDesc})`)
            }
          />
        </>
      )}
    </section>

      {/* 아래 3레인 × 4장 */}
      <section className="gl-lanes3">
        {Array.from({ length: lanes }).map((_, laneIdx) => (
          <div className="gl-laneCol" key={`bot-${laneIdx}`}>
            {Array.from({ length: botCountPerLane }).map((__, i) => (
              <div className="gl-card" key={`b-${laneIdx}-${i}`} />
            ))}
          </div>
        ))}
      </section>

      <Energy value={energy}/>

      {/* 손패 6x2 = 12 */}
      <section className="gl-hand12">
        {sampleCards.map(card => (
          <Card
            key={card.cardId}
            cardId={card.cardId}
            name={card.name}
            imageUrl={card.imageUrl}
            cost={card.cost}
            power={card.power}
            faction={card.faction}
            effectDesc={card.effectDesc}
            active={card.active}
            createdAt={card.createdAt}
            updatedAt={card.updatedAt}
            onCardClick={() => handleCardClick(card)}
          />
        ))}
      </section>

      <footer className="gl-footer">
        <button className="gl-endBtn">턴 종료 (1/6)</button>
      </footer>
    </div>

      {selectedCard && (
        <div className="modal-backdrop">
          <EnlargedCard card={selectedCard} onClose={handleCloseModal} />
        </div>
      )}
      
      {/* 채팅 아이콘 */}
      <button className="chat-icon" onClick={handleToggleChat}>
        💬
        {unreadCount > 0 && (
          <span className="chat-badge">{unreadCount}</span>
        )}
      </button>

      {/* 채팅 박스 */}
      <ChatBox
        isOpen={isChatOpen}
        onClose={handleToggleChat}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        nickname={user?.nickname}
      />
  </div>
  );
}
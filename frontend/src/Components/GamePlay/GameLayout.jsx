// src/Components/GamePlay/GameLayout.jsx

import { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import "./GameLayout.css";
import Card from "./Card";
import Location from "./Location";
import Energy from "./Energy";
import Slot from "./Slot";
import EnlargedCard from "./EnlargedCard";
import EnlargedLocation from "./EnlargedLocation";
import defaultImg from "../../assets/koreaIcon.png";
import DCI from "../../assets/defaultCardImg.svg";
// import { fetchLocations } from "./api/location";
import GameChatFloatingButton from "./GameChatFloatingButton";
import { fetchLocationsByMatchId } from "./api/location";
import { playCardAction, endTurnAction } from "./api/playAction";
import useMatchParticipant from "./hooks/useMatchParticipant";


export default function GameLayout({ matchId }) {
  const handCount = 12;
  const maxTurn = 6;

  const { user } = useUser();
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]); // 서버에서 불러올 위치 데이터
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [opponentPowers] = useState([0, 0, 0]);
  const [myPowers, setMyPowers] = useState([0, 0, 0]);
  const [turn, setTurn] = useState(1);
  const [hand, setHand] = useState([]);
  const [cardPlayed, setCardPlayed] = useState(false);
  const [allCards, setAllCards] = useState([]);
  const [isEndingTurn, setIsEndingTurn] = useState(false);

  const matchIdNumber = Number(matchId);
  const normalizedMatchId = Number.isNaN(matchIdNumber) ? null : matchIdNumber;

  const {
    participantId,
    energy,
    setEnergy,
    loading: participantLoading,
    error: participantError,
    isReady: isParticipantReady,
  } = useMatchParticipant(normalizedMatchId, user?.guestId);

  const isCardInteractionDisabled =
    !isParticipantReady || participantLoading || Boolean(participantError);

  const participantStatusMessage = (() => {
    if (participantLoading) {
      return "매치 참가자 정보를 불러오는 중입니다...";
    }

    if (participantError) {
      return "참가자 정보를 불러오는 데 실패했습니다. 새로고침 후 다시 시도해 주세요.";
    }

    if (!isParticipantReady) {
      return "참가자 정보를 찾을 수 없어 카드를 낼 수 없습니다.";
    }

    return null;
  })();

  const participantStatusVariant = participantError
    ? "error"
    : participantLoading
    ? "info"
    : !isParticipantReady
    ? "warning"
    : null;

  // 선택한 덱의 카드들을 불러와 hand와 allCards 구성
  useEffect(() => {
    async function loadDeckCards() {
      if (!user?.selectedDeckPresetId) return;
      try {
        const resDeck = await fetch(`${import.meta.env.VITE_API_BASE}/api/deck-presets/${user.selectedDeckPresetId}`);
        if (!resDeck.ok) throw new Error(`Failed to load deck preset: ${resDeck.status}`);
        const deckData = await resDeck.json();
        const deck = deckData.result ?? deckData;
        const cardIds = (deck.cards ?? []).map(c => c.cardId);

        const cardPromises = cardIds.map(cardId =>
          fetch(`${import.meta.env.VITE_API_BASE}/api/cards/${cardId}`)
            .then(r => r.ok ? r.json() : Promise.reject(r.status))
            .then(d => d.result ?? d)
        );
        const cards = await Promise.all(cardPromises);

        const mapped = cards.map(item => ({
          cardId: item.cardId,
          name: item.name,
          imageUrl: item.imageUrl || DCI,
          cost: item.cost,
          power: item.power,
          faction: item.faction,
          effectDesc: item.effectDesc,
          active: item.active,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));

        setAllCards(mapped);
        setHand(mapped.slice(0, 3));
      } catch (e) {
        console.error("덱 카드 불러오기 실패:", e);
      }
    }
    loadDeckCards();
  }, [user?.selectedDeckPresetId]);

  useEffect(() => {
    async function loadLocations() {
      if (!matchId) {
        setError("매치 ID가 없습니다.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchLocationsByMatchId(matchId);
        if (data.success && Array.isArray(data.result)) {
          console.log("서버에서 받은 매치 지역 데이터:", data.result);
          console.log("서버에서 받은 매치 지역 개수:", data.result.length);
          const formatted = data.result.map((item) => ({
            locationId: item.location.locationId,
            name: item.location.name,
            imageUrl: item.location.imageUrl || defaultImg,
            effectDesc: item.location.effectDesc,
            isActive: item.location.isActive,
            revealedTurn: item.revealedTurn,
            matchId: item.matchId,
            slotIndex: item.slotIndex,
          }));
          const sorted = formatted.sort((a, b) => a.slotIndex - b.slotIndex);
          console.log("매치 지역 ID:", sorted.map(loc => loc.locationId).join(", "));
          setLocations(sorted);
        } else {
          throw new Error("서버 응답이 올바르지 않습니다.");
        }
      } catch (err) {
        console.error("위치 정보 불러오기 실패:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadLocations();
  }, [matchId]);

  const handleCardClick = (cardData) => {
    setSelectedCard(cardData);
  };

  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  const handleCardDrop = async (cardData, laneIndex = 0, _cellIndex, revertPlacement) => {
    if (!cardData) {
      return;
    }

    if (isCardInteractionDisabled) {
      console.warn("참가자 정보가 준비되지 않아 카드를 낼 수 없습니다.");
      revertPlacement?.();
      return;
    }

    if (!normalizedMatchId || !participantId) {
      console.warn("플레이어 정보가 준비되지 않아 카드를 낼 수 없습니다.", {
        matchId: normalizedMatchId,
        participantId,
      });
      revertPlacement?.();
      return;
    }

    const handIndex = hand.findIndex((c) => c.cardId === cardData.cardId);
    if (handIndex === -1) {
      revertPlacement?.();
      return;
    }

    const cardCost = Number(cardData.cost ?? 0);
    if (Number.isFinite(cardCost) && energy < cardCost) {
      console.warn("에너지가 부족하여 카드를 낼 수 없습니다.", {
        energy,
        cardCost,
        cardId: cardData.cardId,
      });
      revertPlacement?.();
      return;
    }

    const previousEnergy = energy;
    const previousPowers = [...myPowers];

    setHand((prev) => prev.filter((c) => c.cardId !== cardData.cardId));
    setCardPlayed(true);
    if (Number.isFinite(cardCost)) {
      setEnergy((prev) => Math.max(prev - cardCost, 0));
    }
    setMyPowers((prev) =>
      prev.map((value, idx) => (idx === laneIndex ? value + (Number(cardData.power) || 0) : value))
    );

    try {
      const response = await playCardAction({
        matchId: normalizedMatchId,
        participantId,
        cardId: cardData.cardId,
        slotIndex: laneIndex,
      });

      if (response?.energy !== undefined && response.energy !== null) {
        setEnergy(response.energy);
      }
    } catch (err) {
      console.error("카드 플레이 실패:", err);
      setCardPlayed(false);
      setHand((prev) => {
        const next = [...prev];
        next.splice(handIndex, 0, cardData);
        return next;
      });
      setEnergy(previousEnergy);
      setMyPowers(previousPowers);
      revertPlacement?.();
    }
  };

  // // 샘플 카드 데이터 12장 (임의 생성)
  // const sampleCards = Array.from({ length: handCount }).map((_, i) => ({
  //   cardId: `card-${i}`,
  //   name: `Card ${i + 1}`,
  //   imageUrl: DCI,
  //   cost: Math.floor(Math.random() * 10) + 1,    // 1~10 랜덤
  //   power: Math.floor(Math.random() * 10) + 1,   // 1~10 랜덤
  //   faction: ["korea", "china", "japan"][i % 3], // 번갈아 korea, china, japan
  //   effectDesc: "Sample effect description",
  //   active: true,
  //   createdAt: new Date().toISOString(),
  //   updatedAt: new Date().toISOString()
  // }));

  const endTurn = async () => {
    if (!cardPlayed || isEndingTurn || isCardInteractionDisabled) {
      return;
    }

    if (!normalizedMatchId || !participantId) {
      console.warn("플레이어 정보가 준비되지 않아 턴을 종료할 수 없습니다.", {
        matchId: normalizedMatchId,
        participantId,
      });
      return;
    }

    setIsEndingTurn(true);
    try {
      const response = await endTurnAction({
        matchId: normalizedMatchId,
        participantId,
      });

      if (response?.energy !== undefined && response.energy !== null) {
        setEnergy(response.energy);
      }

      if (turn < maxTurn) {
        setTurn((prev) => prev + 1);
      }
      setCardPlayed(false);

      setHand((prev) => {
        const nextIndex = prev.length;
        if (nextIndex < Math.min(handCount, allCards.length)) {
          const nextCard = allCards[nextIndex];
          if (nextCard) {
            return [...prev, nextCard];
          }
        }
        return prev;
      });
    } catch (err) {
      console.error("턴 종료 실패:", err);
    } finally {
      setIsEndingTurn(false);
    }
  };

  const handleLocationClick = (locationData, index) => {
    // locationData에 myPower, opponentPower가 없다면,
    // GameLayout의 state에서 가져와 합쳐줍니다.
    const locationWithPowers = {
      ...locationData,
      opponentPower: opponentPowers[index],
      myPower: myPowers[index],
    };
    setSelectedLocation(locationWithPowers);
  };

  const handleCloseLocationModal = () => {
    setSelectedLocation(null);
  };


  return (
    <>
    <div className="gl-wrap">
      <section className="gl-lanes3">
        <Slot isMySide={false} slotIndex={0} />
        <Slot isMySide={false} slotIndex={1} />
        <Slot isMySide={false} slotIndex={2} />
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
            handleLocationClick(locations[0], 0)
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
              handleLocationClick(locations[1], 1)
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
              handleLocationClick(locations[2], 2)
            }
          />
        </>
      )}
    </section>

      <section className="gl-lanes3">
        <Slot
          isMySide
          slotIndex={0}
          onCardDrop={handleCardDrop}
          disabled={isCardInteractionDisabled}
        />
        <Slot
          isMySide
          slotIndex={1}
          onCardDrop={handleCardDrop}
          disabled={isCardInteractionDisabled}
        />
        <Slot
          isMySide
          slotIndex={2}
          onCardDrop={handleCardDrop}
          disabled={isCardInteractionDisabled}
        />
      </section>

      {participantStatusMessage && (
        <div
          className={[
            "gl-status",
            participantStatusVariant
              ? `gl-status--${participantStatusVariant}`
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {participantStatusMessage}
        </div>
      )}

      <div className="gl-buttons-wrap">
        <Energy value={energy} />
        <button
          className="gl-endBtn"
          onClick={endTurn}
          disabled={
            !cardPlayed ||
            turn === maxTurn ||
            isEndingTurn ||
            isCardInteractionDisabled
          }
        >
          {isEndingTurn ? "턴 종료 중..." : `턴 종료 (${turn} / ${maxTurn})`}
        </button>
      </div>

      {/* 손패 */}
      <section className="gl-hand12">
        {hand.map((card) => (
          <div
            key={card.cardId}
            draggable={!isCardInteractionDisabled}
            onDragStart={(e) => {
              if (isCardInteractionDisabled) {
                e.preventDefault();
                return;
              }
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData(
                "application/json",
                JSON.stringify(card)
              );
            }}
            aria-disabled={isCardInteractionDisabled}
          >
            <Card {...card} onCardClick={() => handleCardClick(card)} />
          </div>
        ))}
      </section>

      {/* 손패 6x2 = 12
      <section className="gl-hand12">
        {sampleCards.map(card => (
          <div
            key={card.cardId}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData("application/json", JSON.stringify(card))}
          >
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
          </div>
        ))}
      </section> */}

      
    </div>

    <GameChatFloatingButton matchId={matchId} />
    
      {selectedCard && (
        <div className="modal-backdrop">
          <EnlargedCard card={selectedCard} onClose={handleCloseModal} />
        </div>
      )}
      {selectedLocation && (
        <div className="modal-backdrop">
          <EnlargedLocation
            location={selectedLocation}
            onClose={handleCloseLocationModal}
          />
        </div>
      )}
    </>
  );
}
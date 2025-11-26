import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { fetchDeckPresetCards } from "../DeckCheck/api/DeckPresetCard.js";
import Card from "../GamePlay/Card";
import Location from "../GamePlay/Location";
import Energy from "../GamePlay/Energy";
import Slot from "../GamePlay/Slot";
import EnlargedCard from "../GamePlay/EnlargedCard";
import EnlargedLocation from "../GamePlay/EnlargedLocation";
import CustomDragLayer from "../GamePlay/CustomDragLayer";
import Topbar from "../TopBar/TopBar.jsx"; 

import "../GamePlay/GameLayout.css";
import "../GamePlay/GameLayoutMobile.css";
import defaultImg from "../../assets/koreaIcon.png"; 

// --- 튜토리얼 시나리오 설정 ---
// 변경된 순서: 인면조(2) -> 흥부(3) -> 놀부(4) -> 춘향(8) -> 전우치(10) -> 홍길동(1) -> 각시탈(65)
const SCENARIO_ORDER = [2, 3, 4, 8, 10, 1, 65, 9];

const TUTORIAL_LOCATIONS = [
  { locationId: 101, name: "훈련소", effectDesc: "병사들의 목소리 크기가 +5db 증가합니다.", isActive: true, imageUrl: defaultImg },
  { locationId: 102, name: "보급기지", effectDesc: "아군의 포만감이 +1 회복됩니다.", isActive: true, imageUrl: defaultImg },
  { locationId: 103, name: "사령부", effectDesc: "전장의 긴장감이 대폭 상승합니다.", isActive: true, imageUrl: defaultImg },
];

const TUTORIAL_STEPS = [
  { step: 0, msg: "미션 1: 1코스트 '인면조'를 첫 번째 구역에 배치하세요." },
  { step: 1, msg: "미션 2: 2코스트 '흥부'를 먼저 배치하세요." },
  { step: 2, msg: "미션 3: '흥부'가 있는 곳에 '놀부'를 배치하여 추가 파워를 얻으세요." },
  { step: 3, msg: "미션 4: 4코스트 '춘향'을 배치하여 지역을 장악하세요!" },
  { step: 4, msg: "미션 5: 강력한 5코스트 '전우치'를 배치하세요." },
  { step: 5, msg: "미션 6: 전우치의 효과로 에너지가 대폭 늘어났습니다. '각시탈'과 '홍길동'을 모두 사용하여 마무리하세요!" },
];

export default function Tutorial() {
  const navigate = useNavigate();
  const handleExit = () => {
    navigate("/home");
  };
  const maxTurn = 6; 
  const SLOT_COUNT = 3;

  const [turn, setTurn] = useState(1);
  const [energy, setEnergy] = useState(2); // 기획 변경: 2 에너지로 시작
  const [myPowers, setMyPowers] = useState([0, 0, 0]);
  const [opponentPowers, setOpponentPowers] = useState([0, 0, 0]);
  
  const [hand, setHand] = useState([]); 
  const [deck, setDeck] = useState([]); 
  
  const [boardLanes, setBoardLanes] = useState([
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ]);
  const [opponentBoardLanes, setOpponentBoardLanes] = useState([
    [], [], []
  ]);

  const [tutorialStep, setTutorialStep] = useState(0);
  const [guideMessage, setGuideMessage] = useState(TUTORIAL_STEPS[0].msg);
  const [loading, setLoading] = useState(true);

  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);

  const handleCloseModal = () => {
    setSelectedCard(null);
  };
  const handleCloseLocationModal = () => {
    setSelectedLocation(null);
  };

    // --- 초기 덱 및 핸드 세팅 ---
  useEffect(() => {
    const loadCards = async () => {
        try {
            setLoading(true);
            const fetchedCards = await fetchDeckPresetCards(1); 
            
            if (fetchedCards && Array.isArray(fetchedCards)) {
                const cardMap = new Map(fetchedCards.map(c => [c.cardId, c]));
                
                // 시나리오 순서대로 덱 재구성
                const orderedDeck = SCENARIO_ORDER.map(id => cardMap.get(id)).filter(Boolean);
                const remainingCards = fetchedCards.filter(c => !SCENARIO_ORDER.includes(c.cardId));
                const finalDeck = [...orderedDeck, ...remainingCards];

                // 초기 세팅
                setHand(finalDeck.slice(0, 3));
                setDeck(finalDeck.slice(3));
            }
        } catch (err) {
            console.error("튜토리얼 덱 로드 실패:", err);
            alert("카드 데이터를 불러오는 데 실패했습니다.");
            navigate("/home");
        } finally {
            setLoading(false);
        }
    };

    loadCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const stepData = TUTORIAL_STEPS.find(s => s.step === tutorialStep);
    if (stepData) setGuideMessage(stepData.msg);
  }, [tutorialStep]);

  // --- Handlers ---
  const handleCardClick = (card, e) => {
    e.stopPropagation();
    if (selectedCardId === card.cardId) {
      setSelectedCard(card);
      setSelectedCardId(null);
    } else {
      setSelectedCardId(card.cardId);
    }
  };

  const handleLocationClick = (locationData, index) => {
    const loc = { ...locationData, opponentPower: opponentPowers[index], myPower: myPowers[index] };
    setSelectedLocation(loc);
  };

  // --- 카드 드롭 로직 ---
  const handleCardDrop = async ({ card, laneIndex }) => {
    if (isWaitingForOpponent) return;

    if (energy < card.cost) {
      alert(`에너지가 부족합니다! (필요: ${card.cost}, 보유: ${energy})`);
      return;
    }

    let bonusPower = 0; // 시너지 보너스

    // --- 시나리오 가이드 (제약 조건) ---
    // Turn 1: 인면조(ID 2) 강제
    if (turn === 1 && card.cardId !== 2) {
        alert("미션 1: 지금은 1코스트 '인면조'를 내야 합니다!");
        return;
    }

    // Turn 2: 흥부(ID 3) 강제 (기획 변경: 흥부 먼저)
    if (turn === 2 && card.cardId !== 3) {
        alert("미션 2: 지금은 '흥부'를 배치해야 합니다!");
        return;
    }

    // Turn 3: 놀부(ID 4) 강제 + 흥부 있는 곳에 배치 강제
    if (turn === 3) {
        if (card.cardId !== 4) {
            alert("미션 3: 지금은 '놀부'를 배치해야 합니다!");
            return;
        }
        
        // 해당 구역에 흥부(ID 3)가 있는지 확인
        const targetLaneCards = boardLanes[laneIndex];
        const hasHungbu = targetLaneCards.some(c => c && c.cardId === 3);

        if (!hasHungbu) {
            alert("미션 3: 놀부는 흥부가 있는 구역에 놓아야 합니다!");
            return;
        }

        // 흥부 + 놀부 시너지 발동
        if (hasHungbu) {
            bonusPower = 3;
        }
    }
    
    // Turn 4: 춘향(ID 8) 강제
    if (turn === 4 && card.cardId !== 8) {
        alert("미션 4: 지금은 4코스트 '춘향'을 내야 합니다!");
        return;
    }

    // Turn 5: 전우치(ID 10) 강제
    if (turn === 5 && card.cardId !== 10) {
        alert("미션 5: 이번 턴에는 '전우치'를 내야 합니다!");
        return;
    }

    // Turn 6: 각시탈(65) & 홍길동(1)
    if (turn === 6 && (card.cardId !== 65 && card.cardId !== 1)) {
        alert("미션 6: 지금은 '각시탈'과 '홍길동' 콤보를 완성해야 합니다!");
        return;
    }

    // 상태 업데이트
    setHand(prev => prev.filter(c => c.cardId !== card.cardId));

    setBoardLanes(prev => {
      const newLanes = [...prev];
      const targetLane = [...newLanes[laneIndex]];
      const slotIdx = targetLane.findIndex(slot => slot === null);
      if (slotIdx !== -1) {
        targetLane[slotIdx] = card;
        newLanes[laneIndex] = targetLane;
      }
      return newLanes;
    });

    setEnergy(prev => prev - card.cost);
    setMyPowers(prev => {
      const newPowers = [...prev];
      newPowers[laneIndex] += (card.power + bonusPower); // 보너스 파워 적용
      return newPowers;
    });
  };

  // --- 턴 종료 및 에너지 계산 로직 ---
  const endTurn = () => {
    if (isWaitingForOpponent) return;
    
    // 1. 기본 카드 배치 체크
    if (turn === 1 && boardLanes.flat().filter(Boolean).length === 0) {
        alert("미션 1: 인면조를 배치해야 합니다!");
        return;
    }

    // 2. 6턴 종료 조건
    if (turn === 6) {
        const flatBoard = boardLanes.flat();
        const hasHongGildong = flatBoard.some(c => c && c.cardId === 1);
        const hasGaksital = flatBoard.some(c => c && c.cardId === 65);

        if (!hasHongGildong || !hasGaksital) {
            alert("미션 6: '홍길동'과 '각시탈'을 모두 배치해야 합니다!");
            return;
        }
    }

    if (turn >= maxTurn) {
        alert("튜토리얼 승리! 홈으로 돌아갑니다.");
        navigate("/home");
        return;
    }
    setGuideMessage("상대방 진행 중...");

    setTimeout(() => {
        // 상대방(AI) 플레이
        const aiLaneIndex = Math.floor(Math.random() * 3);
        const aiCard = { 
            name: "적군", 
            power: 2, 
            cost: 1, 
            imageUrl: defaultImg,
            desc: "적군의 경계 태세가 1단계 강화됩니다."
        };

        setOpponentBoardLanes(prev => {
            const newLanes = [...prev];
            if(newLanes[aiLaneIndex].length < 4) {
                 newLanes[aiLaneIndex] = [...newLanes[aiLaneIndex], aiCard];
            }
            return newLanes;
        });
        setOpponentPowers(prev => {
            const newPowers = [...prev];
            newPowers[aiLaneIndex] += aiCard.power;
            return newPowers;
        });

        // 2. 턴 및 에너지 업데이트
        setTurn(prev => {
            const nextTurn = prev + 1;
            
            // 기획 변경: 에너지는 턴 + 1 (2부터 시작해서 마지막에 7)
            let nextEnergy = nextTurn + 1;
            
            setEnergy(nextEnergy);

            // 가이드 메시지 업데이트
            if (nextTurn <= TUTORIAL_STEPS.length) {
                setTutorialStep(nextTurn - 1);
            }

            return nextTurn;
        });

        // 드로우
        if (deck.length > 0) {
            const cardToDraw = deck[0]; 
            const newDeck = deck.slice(1); 
            setHand(prevHand => [...prevHand, cardToDraw]);
            setDeck(newDeck);
        }

        setIsWaitingForOpponent(false);
    }, 1500);
}


  if (loading) {
      return <div className="gameplay-shell"><div className="board-message board-message--full">튜토리얼 준비 중...</div></div>;
  }

  return (
    <>
      <Topbar screenType="gameplay" onExit={handleExit} /> 

      <div className="gameplay-shell"> {/* Topbar 공간 확보 */}
        <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
          <CustomDragLayer selectedCard={selectedCard} />
          
          <div className="tutorial-guide-bar" style={{
              position: 'absolute', top: '0px', left: '50%', transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.85)', color: '#fff', padding: '12px 24px',
              borderRadius: '30px', zIndex: 900, border: '2px solid #00d4ff',
              fontSize: '1rem', fontWeight: 'bold', width: '90%', maxWidth: '600px', textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
          }}>
            {guideMessage}
          </div>

          <div className="gameplay-body">
            <aside className="hud-panel">
              <div className="hud-matchup">
                <span className="hud-player hud-player--opponent">AI 교관</span>
                <span className="hud-vs">VS</span>
                <span className="hud-player hud-player--me">나</span>
              </div>
              <div className="hud-section">
                <Energy value={energy} />
              </div>
              <div className="hud-section" style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <button
                  className="end-turn-button"
                  onClick={endTurn}
                  disabled={isWaitingForOpponent}
                  style={isWaitingForOpponent ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  <span>{isWaitingForOpponent ? "진행 중..." : "턴 종료"}</span><br/>
                  <span>({turn} / {maxTurn})</span>
                </button>
              </div>
            </aside>

            <main className="board-wrapper">
              <div className="board-grid">
                {Array.from({ length: SLOT_COUNT }).map((_, i) => (
                  <div className="board-cell board-cell--slot board-cell--enemy" key={`enemy-slot-${i}`}>
                    <Slot 
                      isMySide={false} 
                      cards={opponentBoardLanes[i]}
                      onCardClick={handleCardClick}
                      selectedCardId={selectedCardId}
                    />
                  </div>
                ))}

                {TUTORIAL_LOCATIONS.map((loc, i) => {
                    const turnsLeft = i + 1 - turn;
                    return (
                        <div className="board-cell board-cell--location" key={loc.locationId}>
                            <Location
                                {...loc}
                                turnsLeft={turnsLeft > 0 ? turnsLeft : 0}
                                opponentPower={opponentPowers[i]}
                                myPower={myPowers[i]}
                                onLocationClick={() => handleLocationClick(loc, i)}
                            />
                        </div>
                    );
                })}

                {Array.from({ length: SLOT_COUNT }).map((_, i) => (
                  <div className="board-cell board-cell--slot board-cell--ally" key={`ally-slot-${i}`}>
                    <Slot 
                      isMySide={true} 
                      laneIndex={i}
                      onDropCard={handleCardDrop}
                      cards={boardLanes[i]}
                      onCardClick={handleCardClick}
                      selectedCardId={selectedCardId}
                    />
                  </div>
                ))}
              </div>
            </main>

            <aside className="hand-panel">
              <div className="hand-grid">
                {hand.map((card) => (
                  <div
                    key={card.cardId}
                    className="hand-card"
                    onClick={(e) => handleCardClick(card, e)}
                  >
                    <Card
                      {...card}
                      isDraggable={!isWaitingForOpponent}
                      isSelected={selectedCardId === card.cardId}
                    />
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </DndProvider>
      </div>

      {selectedCard && (
        <div className="modal-backdrop" onClick={handleCloseModal}>
          <EnlargedCard card={selectedCard}/>
        </div>
      )}
      {selectedLocation && (
              <div className="modal-backdrop" onClick = {handleCloseLocationModal}>
                <EnlargedLocation
                  location={selectedLocation}
                />
              </div>
            )}
    </>
  );
}
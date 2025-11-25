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
import "../GamePlay/GameLayout.css";
import "../GamePlay/GameLayoutMobile.css";
import defaultImg from "../../assets/koreaIcon.png"; 

// --- 튜토리얼 시나리오 설정 ---
// 시나리오 카드 등장 순서 (서버 데이터를 이 순서로 정렬)
// 첫번째 턴 인면조, 놀부, 전우치 -> 인면조 배치
// 두번째 턴 놀부, 전우치, 흥부 -> 놀부 or 흥부 배치
// 세번째 턴 전우치, 흥부/놀부, 춘향 -> 흥부 or 놀부 배치
// 네번째 턴 전우치, 춘향, 이무기 -> 춘향 배치 (자유)
// 다섯번째 턴 전우치, 이무기, 홍길동 -> 전우치 배치
// 여섯번째 턴 각시탈, 이무기, 홍길동 -> 각시탈 + 홍길동 배치

// 드로우 시나리오
// 처음 3장 흭득 인면조, 놀부, 전우치
// 두번째 턴 드로우 흥부
// 세번째 턴 드로우 춘향
// 네번째 턴 드로우 이무기
// 다섯번째 턴 드로우 홍길동
// 여섯번째 턴 드로우  각시탈
const SCENARIO_ORDER = [2, 4, 10, 3, 8, 9, 1, 65];

const TUTORIAL_LOCATIONS = [
  { locationId: 101, name: "훈련소", effectDesc: "아군의 파워가 +1 증가합니다.", isActive: true, imageUrl: defaultImg },
  { locationId: 102, name: "보급기지", effectDesc: "턴 종료 시 에너지를 1 회복합니다.", isActive: true, imageUrl: defaultImg },
  { locationId: 103, name: "사령부", effectDesc: "6턴 종료 후 승리 시 보너스 점수.", isActive: true, imageUrl: defaultImg },
];

const TUTORIAL_STEPS = [
  { step: 0, msg: "미션 1: 1코스트 '인면조'를 첫 번째 구역에 배치하세요." },
  { step: 1, msg: "미션 2-1: 2코스트 '놀부' 혹은 '흥부'를 배치하여 파워를 확보하세요." },
  { step: 2, msg: "미션 2-2: 남은 2코스트 유닛을 배치하여 파워를 확보하세요." },
  { step: 3, msg: "미션 3: 4코스트 '춘향'을 배치하여 지역을 장악하세요!" },
  { step: 4, msg: "미션 4: 강력한 5코스트 '전우치'를 배치하세요. 전우치는 다음 턴 에너지를 늘려줍니다!" },
  { step: 5, msg: "미션 5: 전우치의 효과로 에너지가 대폭 늘어났습니다. '각시탈'과 '홍길동'을 모두 사용하여 마무리하세요!" },
];

export default function Tutorial() {
  const navigate = useNavigate();
  const maxTurn = 6; 
  const SLOT_COUNT = 3;

  const [turn, setTurn] = useState(1);
  const [energy, setEnergy] = useState(1); 
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
                //카드 데이터 매핑 (서버 데이터를 받아와 사용)
                const cardMap = new Map(fetchedCards.map(c => [c.cardId, c]));
                
                //시나리오 순서대로 덱 재구성
                const orderedDeck = SCENARIO_ORDER.map(id => cardMap.get(id)).filter(Boolean);
                
                //시나리오에 없는 나머지 카드들도 뒤에 붙여줌 (혹시 모를 오류 방지)
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
    // --- 시나리오 가이드 (제약 조건) ---
    // Turn 1: 인면조(ID 2) 강제
    if (turn === 1 && card.cardId !== 2) {
        alert("미션 1: 지금은 1코스트 '인면조'를 내야 합니다!");
        return;
    }

    // Turn 2, 3: 흥부(ID 3) 또는 놀부(ID 4) 강제
    // (시나리오상 2턴에 둘 중 하나, 3턴에 남은 하나를 내게 됩니다)
    if ((turn === 2 || turn === 3) && (card.cardId !== 3 && card.cardId !== 4)) {
        alert("미션 2: 지금은 '흥부' 또는 '놀부'를 배치해야 합니다!");
        return;
    }
    if (turn === 4 && card.cardId !== 8) {
        alert("미션 3: 지금은 4코스트 '춘향'을 내야 합니다!");
        return;
    }

    // Turn 5: 전우치(ID 10) 강제
    if (turn === 5 && card.cardId !== 10) {
        alert("미션 4: 이번 턴에는 '전우치'를 내서 효과를 발동시켜야 합니다!");
        return;
    }
    if (turn === 6 && (card.cardId !== 65 && card.cardId !== 1)) {
        alert("미션 5: 지금은 '각시탈'과 '홍길동' 콤보를 완성해야 합니다!");
        return;
    }

    // 상태 업데이트 (손패 제거, 보드 배치, 에너지 차감, 파워 증가)
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
      newPowers[laneIndex] += card.power;
      return newPowers;
    });
  };

  // --- 턴 종료 및 에너지 계산 로직 ---
  const endTurn = () => {
    if (isWaitingForOpponent) return;
    
    // 1. 기본 카드 배치 체크 (1턴 등)
    if (turn === 1 && boardLanes.flat().filter(Boolean).length === 0) {
        alert("미션 1: 인면조를 배치해야 합니다!");
        return;
    }

    // 2. 6턴 종료 조건: 홍길동(1)과 각시탈(65)이 모두 보드에 있어야 함
    if (turn === 6) {
        const flatBoard = boardLanes.flat();
        const hasHongGildong = flatBoard.some(c => c && c.cardId === 1);
        const hasGaksital = flatBoard.some(c => c && c.cardId === 65);

        if (!hasHongGildong || !hasGaksital) {
            alert("미션 5: '홍길동'과 '각시탈'을 모두 배치해야 합니다!");
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
        // 1. 상대방(AI) 플레이
        const aiLaneIndex = Math.floor(Math.random() * 3);
        const aiCard = { name: "적군", power: 2, cost: 0, imageUrl: defaultImg };

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
        // 전우치(ID 10)가 보드에 존재하는지 확인
        const isJeonwoochiPlayed = boardLanes.flat().some(c => c && c.cardId === 10);
        
        setTurn(prev => {
            const nextTurn = prev + 1;
            
            // 기본 에너지 규칙: n턴 = n에너지
            let nextEnergy = nextTurn;
            
            // 6턴일 때 전우치가 있으면 에너지 8 (6 + 2)로 설정
            if (nextTurn === 6 && isJeonwoochiPlayed) {
                nextEnergy = 8; 
            }

            setEnergy(nextEnergy);

            // 가이드 메시지 업데이트
            if (nextTurn <= TUTORIAL_STEPS.length) {
                setTutorialStep(nextTurn - 1);
            }

            return nextTurn;
        });

        // 드로우
        if (deck.length > 0) {
            const cardToDraw = deck[0];       // 0번째 카드 확인
            const newDeck = deck.slice(1);    // 나머지 덱 생성
            setHand(prevHand => [...prevHand, cardToDraw]); // 핸드에 추가
            setDeck(newDeck);                 // 덱 업데이트
        }

        setIsWaitingForOpponent(false);
    }, 1500);
}


  const getLocationDisabled = (index) => turn < index + 1;

  if (loading) {
      return <div className="gameplay-shell"><div className="board-message board-message--full">튜토리얼 준비 중...</div></div>;
  }

  return (
    <>
      <div className="gameplay-shell">
        <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
          <CustomDragLayer selectedCard={selectedCard} />
          
          <div className="tutorial-guide-bar" style={{
              position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.85)', color: '#fff', padding: '12px 24px',
              borderRadius: '30px', zIndex: 1000, border: '2px solid #00d4ff',
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
              <div className="hud-section">
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
                      disabled={getLocationDisabled(i)}
                      cards={opponentBoardLanes[i]}
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
                      disabled={getLocationDisabled(i)}
                      laneIndex={i}
                      onDropCard={handleCardDrop}
                      cards={boardLanes[i]}
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
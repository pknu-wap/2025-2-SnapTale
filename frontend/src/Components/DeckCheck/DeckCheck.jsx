import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { fetchDeckPresetCards, updateSelectedDeck } from "./api/DeckPresetCard.js";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { useUser } from "../../contexts/UserContext"
import Card from "../GamePlay/Card";
import EnlargedCard from "../GamePlay/EnlargedCard";
import TopBar from "../TopBar/TopBar.jsx";
import FactionIcon from "./FactionIcon"
//import DCI from "../../assets/defaultCardImg.svg";
import koreaIcon from "../../assets/koreaIcon.png";
import chinaIcon from "../../assets/chinaIcon.png";
import japanIcon from "../../assets/japanIcon.png";
import './DeckCheck.css';

const factionToDeckPresetId = {
  korea: 1,
  china: 2,
  japan: 3,
};


//덱 확인 페이지
const DeckCheck = () => {
    const [selectedFaction, setSelectedFaction] = useState("korea");
    const [cards, setCards] = useState([]);
    const { user, updateUser } = useUser();
    const [selectedCard, setSelectedCard] = useState(null);
    const [isHorizontal, setIsHorizontal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
    const loadCards = async () => {
        try {
            const deckPresetId = factionToDeckPresetId[selectedFaction];
            const fetchedCards = await fetchDeckPresetCards(deckPresetId);
            
            setCards(fetchedCards);
            
            // 카드가 있으면 첫 번째 카드를 선택 상태로, 없으면 null
            if (fetchedCards && fetchedCards.length > 0) {
                setSelectedCard(fetchedCards[0]);
            } else {
                setSelectedCard(null);
            }

        } catch (err) {
            console.error("덱 카드 불러오기 실패:", err);
        } 
    };

    loadCards();
}, [selectedFaction]);

    const handleCardClick = (cardData) => {
        setSelectedCard(cardData);
    };
    const handleFactionClick = (faction) => {
        setSelectedFaction(faction);
    };

    const handleLayoutToggle = () => {
        setIsHorizontal(!isHorizontal);
    };

    const handleSaveClick = async () => {
        const selectedDeckId = factionToDeckPresetId[selectedFaction];

    if (!user) {
        alert("유저 정보가 없습니다. 다시 로그인 해주세요.");
        return;
    }

    try {
        const response = await updateSelectedDeck(user.guestId, selectedDeckId);
        if (response.success) {
            updateUser({selectedDeckPresetId: selectedDeckId});
            alert("덱 저장됨!");
            navigate('/home');
        } else {
            alert("덱 선택 실패: " + response.message);
        }
      } catch (err) {
        console.error(err);
        alert("덱 저장 중 오류 발생");
      } 
    };

  return (
    <>
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
        <div className="deck-layout">
          <TopBar screenType="deckcheck" onSave={handleSaveClick} />
          <div className="DeckCheck-container">
            {/* 한중일 지역 선택 아이콘, 텍스트*/}
            <div className="deck-select">
                <div className="faction-icons">
                    <div className="faction-item">
                        <FactionIcon
                            image={koreaIcon}
                            selected={selectedFaction === "korea"}
                            onClick={() => handleFactionClick("korea")}
                        />
                    </div>
                    <div className="faction-item">
                        <FactionIcon
                            image={chinaIcon}
                            selected={selectedFaction === "china"}
                            onClick={() => handleFactionClick("china")}
                        />
                    </div>
                    <div className="faction-item">
                        <FactionIcon
                            image={japanIcon}
                            selected={selectedFaction === "japan"}
                            onClick={() => handleFactionClick("japan")}
                        />
                    </div>
                </div>
                <div className="faction-text" onClick={handleLayoutToggle}>
                    {selectedFaction === "korea" && "한국"}
                    {selectedFaction === "china" && "중국"}
                    {selectedFaction === "japan" && "일본"}
                </div>
            </div>
        </div>
        {/* deck-section, selected-card 레이아웃 조절*/}
        <div className={`deck-cards-container ${isHorizontal ? 'horizontal' : ''}`}>
            {/* 덱 카드 12장 전체 보기*/}
            <section className="deck-section">
                    <div className="deck-grid">
                        {cards.map((card) => (
                            <div key={card.cardId} className="deck-grid-item">
                                <Card
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
                                    isDraggable={false}
                                />
                            </div>
                        ))}
                    </div>
            </section>
            {/* 선택된 카드 자세히 보기*/}
            <div className="selected-card">
                <EnlargedCard card={selectedCard} onClose={null} />
            </div>
        </div>  
    </div>
    </DndProvider>
    </>
    );
};
export default DeckCheck;
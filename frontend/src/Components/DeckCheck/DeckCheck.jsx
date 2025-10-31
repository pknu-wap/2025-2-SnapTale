import { useState, useEffect } from "react";
import { fetchDeckPresetCards } from "./api/DeckPresetCard.js";
import Card from "../GamePlay/Card";
import EnlargedCard from "../GamePlay/EnlargedCard";
import StoreButton from "./storeButton.jsx";
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
    const [selectedCard, setSelectedCard] = useState(null);
    
    useEffect(() => {
    const loadCards = async () => {
        try {
            const deckPresetId = factionToDeckPresetId[selectedFaction];
            const fetchedCards = await fetchDeckPresetCards(deckPresetId);
            setCards(fetchedCards);
            if (fetchedCards.length > 0) {
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

  return (
    <div className="DeckCheck-container">
        {/* 상단 메뉴 (나가기 버튼) */}
        <header className="deck-top-menu">
            <StoreButton/>
        </header>
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
            <div className="faction-text">
                {selectedFaction === "korea" && "한국"}
                {selectedFaction === "china" && "중국"}
                {selectedFaction === "japan" && "일본"}
            </div>
        </div>
        {/* 덱 카드 전체 보기*/}
        <section className="deck-section">
        {cards.length > 0 ? (
            cards.map((card) => (
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
            ))
        ) : (
            <p className="loading-text">카드를 불러오는 중...</p>
        )}
        </section>
        {/* 선택된 카드 자세히 보기*/}
        <div className="selected-card">
            <EnlargedCard card={selectedCard} onClose={null} />
        </div>
    </div>
    );
};
export default DeckCheck;
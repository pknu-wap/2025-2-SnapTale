import { useState, useMemo } from "react";
import Card from "../GamePlay/Card";
import EnlargedCard from "../GamePlay/EnlargedCard";
import ExitIcon from "./Exit";
import FactionIcon from "./FactionIcon"
import DCI from "../../assets/defaultCardImg.svg";
import koreaIcon from "../../assets/koreaIcon.png";
import chinaIcon from "../../assets/chinaIcon.png";
import japanIcon from "../../assets/japanIcon.png";
import './DeckCheck.css';


//덱 확인 페이지
const DeckCheck = () => {
    const [selectedFaction, setSelectedFaction] = useState("korea");
     const handCount = 12;
    const sampleCards = useMemo(() => {
        return Array.from({ length: handCount }).map((_, i) => ({
            cardId: `card-${i}`,
            name: `Card ${i + 1}`,
            imageUrl: DCI,
            cost: Math.floor(Math.random() * 10) + 1,
            power: Math.floor(Math.random() * 10) + 1,
            faction: selectedFaction,
            effectDesc: "Sample effect description",
            active: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));
    }, [selectedFaction]);
    const [selectedCard, setSelectedCard] = useState(sampleCards[0]);
    
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
            <ExitIcon/>
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
        {/* 선택된 카드 자세히 보기*/}
        <div className="selected-card">
            <EnlargedCard card={selectedCard} onClose={null} />
        </div>
    </div>
  );
};
export default DeckCheck;
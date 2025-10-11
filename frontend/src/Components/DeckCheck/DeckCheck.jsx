import { useState, useEffect } from "react";
import { fetchDeckPresetCards } from "./api/DeckPresetCard.js";
// import { fetchCardsAll} from "./api/DeckPresetCard.js";
import Card from "../GamePlay/Card";
import EnlargedCard from "../GamePlay/EnlargedCard";
import ExitIcon from "./Exit";
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
//     const [factionCards, setFactionCards] = useState({
//     korea: [],
//     china: [],
//     japan: [],
//   });
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
            }

            // const allCards = await fetchCardsAll();
            // console.log("Fetched cards:", allCards.length); //카드 전체 불러오기인데 불러온 카드가 12개임

            // //카드를 진영별로 분류하여 배열에 저장
            // const grouped = {
            //     korea: allCards.filter((c) => c.faction === "한국"),
            //     china: allCards.filter((c) => c.faction === "중국"),
            //     japan: allCards.filter((c) => c.faction === "일본"),
            // };
            // setFactionCards(grouped);
            
            // //선택한 진영의 카드가 있으면 0번째 카드로 "확대된 카드" 초기 설정
            // if (grouped[selectedFaction].length > 0) {
            //     setSelectedCard(grouped[selectedFaction][0]);
            // }
        } catch (err) {
            console.error("덱 카드 불러오기 실패:", err);
            }
        };
        loadCards();
    }, [selectedFaction]);

    //진영이 변경될 때, 해당 진영 카드 중 첫 번째 카드 선택
    // useEffect(() => {
    //     if (factionCards[selectedFaction].length > 0) {
    //         setSelectedCard(factionCards[selectedFaction][0]);
    //     } else {
    //     setSelectedCard(null);
    //     }
    // }, [selectedFaction, factionCards]);
    
    
    const handleCardClick = (cardData) => {
        setSelectedCard(cardData);
    };
    const handleFactionClick = (faction) => {
        setSelectedFaction(faction);
    };

    //현재 선택된 진영의 카드들만 렌더링
    // const currentCards = factionCards[selectedFaction] || [];

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
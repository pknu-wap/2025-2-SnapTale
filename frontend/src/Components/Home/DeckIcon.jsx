import deckIcon from "../../assets/DeckIcon.png";
/*추후에 덱 선택 아이콘으로 교체할 예정 */
const DeckIcon = () => {
  return (
    <img
        src = {deckIcon} 
        alt= "Deck Icon" 
        width={80} 
        height={80}
    />
  );
};
export default DeckIcon;
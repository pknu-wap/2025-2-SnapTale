import './FactionIcon.css'
const FactionIcon = ({image, selected, onClick}) => {
  return (
    <img 
        className= {`Faction ${selected ? "selected" : ""}`}  
        src = {image}
        alt = "지역 아이콘"
        onClick = {onClick}
        selected = {selected}>
    </img>
  );
};
export default FactionIcon;
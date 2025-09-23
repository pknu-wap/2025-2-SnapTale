import './Soundbar.css'
import speakerIcon from "../../assets/speakerIcon.png";
const Soundbar = () => {
  return (
    <div className="sound-bar">
        <img className="speakerIcon"
            src = {speakerIcon} 
            alt= "speakerIcon" 
            width={55} 
            height={55}
        />
        <input 
            type="range" 
            className="slider" 
            min="0" 
            max="1" 
            step="0.01" 
            defaultValue="1"
            id="volume-control"
        />
    </div>
  );
};
export default Soundbar;
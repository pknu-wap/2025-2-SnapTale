import { useNavigate } from "react-router-dom";
import "./TopBar.css";
import SoundIcon from "../Home/SoundIcon";
import DeckIcon from "../Home/DeckIcon";
import ExitButton from "../GamePlay/ExitButton";
import StoreButton from "../DeckCheck/storeButton";

// 사용 예시: import TopBar from "../Layout/TopBar"; -> <TopBar screenType="home" />
export default function TopBar({ screenType, onSave, onExit }) {
  const navigate = useNavigate();

  const renderRightButtons = () => {
    switch (screenType) {
      case "home":
        return (
          <div className="icon-btn">
            <DeckIcon />
          </div>
        );
      case "gameplay": {
        const handleExit = onExit ?? (() => navigate("/home"));
        return (
          <div className="icon-btn">
            <ExitButton onClick={handleExit} />
          </div>
        );
      }
      case "deckcheck":
        return (
          <div className="icon-btn">
            <StoreButton onClick={onSave} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="top-bar">
      <div className="left-buttons">
        <div className="icon-btn">
          <SoundIcon />
        </div>
      </div>

      <div className="right-buttons">{renderRightButtons()}</div>
    </div>
  );
}
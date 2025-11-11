import { useState } from "react";
import speakerOn from "../../../assets/speakerOn.png";
import speakerOff from "../../../assets/speakerOff.png";
import "./buttonCommon.css";

const SoundIcon = () => {
  const [isMuted, setIsMuted] = useState(false);

  const handleSpeakerClick = () => {
    setIsMuted((prevMuted) => !prevMuted);
  };

  return (
    <button
      type="button"
      className="common-btn sound-btn"
      onClick={handleSpeakerClick}
      aria-label={isMuted ? "Unmute sound" : "Mute sound"}
      aria-pressed={isMuted}
    >
      <img
        src={isMuted ? speakerOff : speakerOn}
        alt={isMuted ? "Sound off" : "Sound on"}
      />
    </button>
  );
};

export default SoundIcon;
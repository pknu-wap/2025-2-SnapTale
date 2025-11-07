import { useState } from 'react';
import speakerOn from "../../../assets/speakerOn.png";
import speakerOff from "../../../assets/speakerOff.png";

const SoundIcon = () => {
  const [isMuted, setIsMuted] = useState(false);

   const handleSpeakerClick = () => {
    setIsMuted(!isMuted); //누를 때마다 on/off 바뀜
  };

  return (
    <>
        <img className="speakerIcon"
            src={isMuted ? speakerOff : speakerOn}
            alt={isMuted ? "speakerIconOff" : "speakerIconOn"}
            width={80} 
            height={80}
            onClick={handleSpeakerClick}
        />
    </>
  );
};
export default SoundIcon;
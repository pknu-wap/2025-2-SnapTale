import exitIcon from "../../assets/exit.png";
import "./Exit.css"
import { useNavigate } from 'react-router-dom';
const ExitIcon = () => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(-1); 
    };
    return (
    <div className="exit-icon-container" onClick={handleClick}>
        <img src={exitIcon} alt="Deck Icon"/>
        <span className="exit-icon-text">
            나가기
        </span>
    </div>
    );
};
export default ExitIcon;
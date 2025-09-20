import { useNavigate } from "react-router-dom";
const Init = () => {
  const navigate = useNavigate();
  const goToHome = () => {
  navigate('/home');
 };
  return (
    <div>
      <h1>초기 화면</h1>
      <button onClick={goToHome}>홈으로 이동 테스트</button>
    </div>
  );
};

export default Init;
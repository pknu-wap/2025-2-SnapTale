import Button from "./Button"
import Profile from "./Profile";
import Soundbar from "./Soundbar";
import './Home.css'

const Home = () => {
  return (
    <div className="home-container">
      
      {/* 상단 메뉴 (사운드바, 프로필) */}
      <header className="top-menu">
        <Soundbar />
        <Profile />
      </header>

      {/* 메인 버튼 영역 */}
      <main className="matching-buttons">
        <Button text={"랜덤 매치"} />
        <Button text={"친선전"} />
        <Button text={"튜토리얼"} />
      </main>

    </div>
  );
};
export default Home;
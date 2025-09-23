import Button from "./Button"
import Profile from "./Profile";
import Soundbar from "./Soundbar";
import Modal from "./Modal";
import { useState } from "react";
import './Home.css'

const Home = () => {
  const [openModal, setOpenModal] = useState(false);
  return (
    <div className="home-container">
      
      {/* 상단 메뉴 (사운드바, 프로필) */}
      <header className="top-menu">
        <Soundbar />
        <Profile />
      </header>

      {/* 메인 버튼 영역 */}
      <main className="matching-buttons">
        <div>
          <Button text={"랜덤 매치"} />
        </div>
        <div>
          <Button text={"친선전"} 
            onClick={() => {
            setOpenModal(true);
          }}
          />
          {openModal && <Modal setOpenModal={setOpenModal}/>} {/* state가 true면 모달창 표시 */}
        </div>
        <Button text={"튜토리얼"} />
      </main>

    </div>
  );
};
export default Home;
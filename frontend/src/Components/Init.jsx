import "./Init.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";
import diceIcon from "../assets/dice.png";
import uiBtn from "../assets/uiBtn.png";

const NICK_RULE = /^[가-힣a-zA-Z0-9]{2,8}$/;

const Init = () => {
  const navigate = useNavigate();
  const [nick, setNick] = useState(""); //닉네임 초기값은 빈 문자열
  const isNickValid = NICK_RULE.test(nick.trim()); //trim: 닉네임 앞 뒤 공백 제거

  const randomNicks = {
    adj: ["푸른","적막한","고요한","은밀한","묘한","허망한","달빛의","안개낀","그윽한","광포한","옹졸한","이상한","천진한","괴상한","비밀스런"],
    noun: ["매화","청랑","적호","설화","연운","운검","곶감","월광","서리","선학","흑월","백호","규린","바람","호리병"]
  };

  const rollNicks = () => {
    const a = randomNicks.adj[Math.floor(Math.random() * randomNicks.adj.length)];
    const n = randomNicks.noun[Math.floor(Math.random() * randomNicks.noun.length)];
    setNick(a + n);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isNickValid) navigate("/home");
  };
  // const goToHome = () => { // navigate('/home'); // };

  return (
    <main className="init-wrap">
      <img src={logo} className="init-logo" />
      <form className="init-form" onSubmit={handleSubmit}>
        <div className="init-input-wrap">
          <input
            className="init-input"
            id="nick"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            placeholder="닉네임 입력"
            maxLength={8}
            aria-invalid={!!(nick && !isNickValid)}
          />
          <button
            type="button"
            className="init-dice"
            onClick={rollNicks}
            aria-label="랜덤 닉네임 생성"
            title="랜덤 닉네임"
          >
            <img src={diceIcon} alt="주사위" className="dice-img" />
          </button>
        </div>

        {nick && !isNickValid && (
          <p className="init-error" role="alert" aria-live="assertive">
            한글/영문/숫자, 2~8자
          </p>
        )}

        <button
          type="submit"
          disabled={!nick || !isNickValid}
          className="init-btn-image"
          aria-label="시작하기"
          style={{ backgroundImage: `url(${uiBtn})` }}
        >시작하기</button>
      </form>
    </main>
  );
};

export default Init;
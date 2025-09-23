import "./Init.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const NICK_RULE = /^[가-힣a-zA-Z0-9]{2,8}$/;

const Init = () => {
  const navigate = useNavigate();
  const [nick, setNick] = useState(""); 
  const isNickValid = NICK_RULE.test(nick.trim()); //trim: 닉네임 앞뒤 공백 제거해줌

  const handleSubmit = (e) => {
    e.preventDefault();
    if(isNickValid) navigate('/home');
  };
//   const goToHome = () => {
//   navigate('/home');
//  };
  return (
    <main className="init-wrap">
      <img src={logo} alt="SnapTale 로고" className="init-logo" />
      <form className="init-form" onSubmit={handleSubmit}>
        <label htmlFor="nick" className="init-label">
          닉네임
        </label>
        <input
          id="nick"
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          placeholder="한글/영문/숫자, 2~8자"
          className="init-input"
          aria-invalid={!!(nick && !isNickValid)}
        />
        <button
          type="submit"
          disabled={!nick || !isNickValid}
          className="init-btn"
        >
          시작하기
        </button>
        {nick && !isNickValid && (
        <p className="init-error">사용할 수 없는 닉네임입니다.</p>
        )}
    </form>
  </main>
  );
};

export default Init;
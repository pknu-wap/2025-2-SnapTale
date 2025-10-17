import "./Init.css";
import { createUser, getUser, updateLastSeen } from "./api/user";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import diceIcon from "../../assets/dice.png";
import uiBtn from "../../assets/uiBtn.png";
import { useUser } from "../../contexts/UserContext.jsx";

const NICK_RULE = /^[가-힣a-zA-Z0-9]{2,8}$/;

const Init = () => {
  const navigate = useNavigate();
  // 1. 상태 단순화: 전역 user 상태와 로컬 nick 상태만 사용합니다.
  const { user, setUser, clearUser } = useUser();
  const [nick, setNick] = useState("");
  const [loading, setLoading] = useState(true); // 처음엔 로딩 상태로 시작
  const isNickValid = NICK_RULE.test(nick.trim());

  const randomNicks = {
    adj: ["푸른","적막한","고요한","은밀한","묘한","허망한","달빛의","안개낀","그윽한","광포한","옹졸한","이상한","천진한","괴상한","비밀스런"],
    noun: ["매화","청랑","적호","설화","연운","운검","곶감","월광","서리","선학","흑월","백호","규린","바람","호리병"]
  };

  const rollNicks = () => {
    const a = randomNicks.adj[Math.floor(Math.random() * randomNicks.adj.length)];
    const n = randomNicks.noun[Math.floor(Math.random() * randomNicks.noun.length)];
    setNick(a + n);
  };

  // 2. useEffect 역할 변경:
  // 컴포넌트가 처음 마운트될 때 딱 한 번만 실행되어
  // localStorage의 사용자 정보가 유효한지 '검증'하고 '전역 상태'를 업데이트하는 역할만 합니다.
  useEffect(() => {
    let isMounted = true;

    const restoreGuest = async () => {
      const storedGuestId = localStorage.getItem("guestId");

      if (!storedGuestId) {
        clearUser();
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const fetchedUser = await getUser(storedGuestId);
        if (isMounted) {
          if (fetchedUser) {
            setUser(fetchedUser); // 검증 성공 시 전역 user 상태 업데이트
            updateLastSeen(fetchedUser.guestId).catch(console.error);
          } else {
            // 서버에 해당 유저가 없으면 로컬 정보도 삭제
            clearUser();
          }
        }
      } catch (err) {
        console.error("세션 복원 실패:", err);
        if (isMounted) clearUser();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    restoreGuest();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열로 설정하여 최초 1회만 실행

  // 3. handleSubmit 역할 명확화: 오직 '새로운 사용자 생성'만 담당합니다.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !isNickValid) return;

    try {
      setLoading(true);
      const createdUser = await createUser(nick.trim());
      setUser(createdUser); // 생성 성공 시 전역 user 상태 업데이트
      navigate("/home");
    } catch (err) {
      alert(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 4. handleGoHome: '게임 시작' 버튼을 위한 함수
  const handleGoHome = () => {
    if (loading) return;
    navigate("/home");
  };

  // 로딩 중일 때는 아무것도 보여주지 않거나 로딩 스피너를 보여줄 수 있습니다.
  if (loading) {
    return <main className="init-wrap">... 로딩 중 ...</main>;
  }

  return (
    <main className="init-wrap">
      <img src={logo} className="init-logo" alt="logo" />
      {/* 5. UI 렌더링 로직 변경: 전역 user 상태에 따라 UI를 결정합니다. */}
      {user ? (
        <section className="init-welcome" aria-live="polite">
          <p className="init-welcome-text">{`${user.nickname}님 환영합니다!`}</p>
          <div className="init-actions">
            <button
              type="button"
              className="init-btn-image"
              onClick={handleGoHome}
              aria-label="게임 시작"
              style={{ backgroundImage: `url(${uiBtn})` }}
            >
              게임 시작!
            </button>
          </div>
        </section>
      ) : (
        <form className="init-form" onSubmit={handleSubmit}>
          {/* ... (닉네임 입력 폼 UI는 동일) ... */}
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
            disabled={loading || !isNickValid}
            className="init-btn-image"
            aria-label="시작하기"
            style={{ backgroundImage: `url(${uiBtn})` }}
          >
            {loading ? "생성 중..." : "시작하기"}
          </button>
        </form>
      )}
    </main>
  );
};

export default Init;
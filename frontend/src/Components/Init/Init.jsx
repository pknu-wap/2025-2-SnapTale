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
  const { user, setUser, clearUser } = useUser();
  const [nick, setNick] = useState(user?.nickname ?? "");
  const [validatedGuest, setValidatedGuest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);
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

  useEffect(() => {
    if (hasAttemptedRestore) {
      return;
    }

    let isMounted = true;

    const restoreGuest = async () => {
      setHasAttemptedRestore(true);

      if (!user?.guestId || !user?.nickname) {
        clearUser();
        if (isMounted) {
          setValidatedGuest(null);
          setNick("");
        }
        return;
      }

      if (isMounted) {
        setLoading(true);
      }

      try {
        const fetchedUser = await getUser(user.guestId);

        if (!isMounted) {
          return;
        }

        if (fetchedUser) {
          const normalizedUser = {
            ...fetchedUser,
            guestId: fetchedUser.guestId ?? user.guestId,
            nickname: fetchedUser.nickname ?? user.nickname,
          };

          setUser(normalizedUser);
          setValidatedGuest(normalizedUser);
          setNick(normalizedUser.nickname ?? "");

          try {
            await updateLastSeen(normalizedUser.guestId);
          } catch (err) {
            console.error(err);
          }

          navigate("/home");
        } else {
          clearUser();
          setValidatedGuest(null);
          setNick("");
        }
      } catch (err) {
        console.error(err);
        clearUser();
        if (isMounted) {
          setValidatedGuest(null);
          setNick("");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreGuest();

    return () => {
      isMounted = false;
    };
  }, [user, clearUser, setUser, navigate, hasAttemptedRestore]);

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (isNickValid) navigate("/home");
  // };
  // const goToHome = () => { // navigate('/home'); // };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (validatedGuest) {
      setNick(validatedGuest.nickname ?? nick);
      navigate("/home");
      return;
    }

    if (!isNickValid) return;

    try {
      setLoading(true);
      const createdUser = await createUser(nick.trim());
      setUser(createdUser);
      setValidatedGuest(createdUser);
      setNick(createdUser.nickname ?? nick.trim());

      try {
        await updateLastSeen(createdUser.guestId);
      } catch (err) {
        console.error(err);
      }

      navigate("/home");
    } catch (err) {
      alert(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


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
          disabled={
            loading || (!validatedGuest && (!nick || !isNickValid))
          }
          className="init-btn-image"
          aria-label="시작하기"
          style={{ backgroundImage: `url(${uiBtn})` }}
        >{loading ? "생성 중..." : "시작하기"}</button>
      </form>
    </main>
  );
};

export default Init;
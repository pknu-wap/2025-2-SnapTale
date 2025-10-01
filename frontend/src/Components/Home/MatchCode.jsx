import { useEffect, useRef } from "react";

function ModalCode({ matchCode }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.fontSize = "24px"; // 초기 폰트 크기

    
    if (el.scrollWidth > 247) { // 내용이 div박스(247px)를 넘으면 줄이기
      el.style.fontSize = "20px";
    }
  }, [matchCode]);

  return (
    <div className="modal-code" ref={ref}>
      매치 코드: {matchCode}
    </div>
  );
}

export default ModalCode;
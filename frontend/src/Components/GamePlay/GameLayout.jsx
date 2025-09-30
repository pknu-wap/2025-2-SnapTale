// src/Components/GamePlay/GameLayout.jsx
import "./GameLayout.css";

export default function GameLayout() {
  const lanes = 3;                 // 왼/중/오
  const topCountPerLane = 4;       // 위 4장
  const botCountPerLane = 4;       // 아래 4장
  const handCount = 12;            // 6x2

  return (
    <div className="gl-wrap">
      <div className="gl-oppo-chip">상대닉네임</div>

      {/* 위 3레인 × 4장 */}
      <section className="gl-lanes3">
        {Array.from({ length: lanes }).map((_, laneIdx) => (
          <div className="gl-laneCol" key={`top-${laneIdx}`}>
            {Array.from({ length: topCountPerLane }).map((__, i) => (
              <div className="gl-card" key={`t-${laneIdx}-${i}`} />
            ))}
          </div>
        ))}
      </section>

      {/* 중앙 정육각 3개 */}
      <section className="gl-hexRow">
        {Array.from({ length: lanes }).map((_, i) => (
          <div className="gl-hex" key={`hex-${i}`} />
        ))}
      </section>

      {/* 아래 3레인 × 4장 */}
      <section className="gl-lanes3">
        {Array.from({ length: lanes }).map((_, laneIdx) => (
          <div className="gl-laneCol" key={`bot-${laneIdx}`}>
            {Array.from({ length: botCountPerLane }).map((__, i) => (
              <div className="gl-card" key={`b-${laneIdx}-${i}`} />
            ))}
          </div>
        ))}
      </section>

      <div className="gl-turnOrb">1</div>

      {/* 손패 6x2 = 12 */}
      <section className="gl-hand12">
        {Array.from({ length: handCount }).map((_, i) => (
          <div className="gl-card gl-handCard" key={`h-${i}`} />
        ))}
      </section>

      <footer className="gl-footer">
        <button className="gl-endBtn">턴 종료 (1/6)</button>
      </footer>
    </div>
  );
}

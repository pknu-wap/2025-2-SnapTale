import './DeckDescModal.css';

const deckDescriptions = {
  korea: {
    title: "한국덱",
    tags: ["연계플레이", "버프폭발", "원턴콤보"],
    desc: "출현 효과를 연계해 한 순간에 판도를 뒤집는 폭발적 콤보 덱",
  },
  china: {
    title: "중국덱",
    tags: ["지속시너지", "누적강화", "병력증가형"],
    desc: "턴이 진행될수록 시너지가 누적되며 필드를 압도하는 안정적 엔진덱",
  },
  japan: {
    title: "일본덱",
    tags: ["이동", "무작위성", "하이리스크하이리턴"],
    desc: "예측 불가 이동과 무작위 효과로 필드를 교란하며 폭발력을 노리는 덱",
  }
};

const DeckDescModal = ({ faction, onClose }) => {
  const data = deckDescriptions[faction];

  if (!data) return null;

  return (
    <div
        className={`deck-desc-modal faction-${faction}`}
        onClick={onClose}
    >
        <h2 className="deck-desc-title">{data.title}</h2>

        <p className="deck-desc-tags">
            {data.tags.map((t) => `#${t} `)}
        </p>

        <p className="deck-desc-text">{data.desc}</p>
    </div>
  );
};
export default DeckDescModal;
import { useDragLayer } from "react-dnd";
import Card from "./Card";

/* 커스텀 드래그 레이어: 드래그 중인 카드를 커서 옆에 표시 */
function CustomDragLayer({ selectedCard = null }) {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    currentOffset: monitor.getSourceClientOffset(),
  }));
  if (selectedCard) return null; //Enlarged card modal이 열려있으면 드래그 미리보기 렌더링 X

  if (!isDragging || !currentOffset || !item) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 10000,
        left: `${currentOffset.x}px`,
        top: `${currentOffset.y}px`,
        opacity: 0.8,
      }}
    >
      <Card
        cardId={item.cardId}
        name={item.name}
        imageUrl={item.imageUrl}
        cost={item.cost}
        power={item.power}
        faction={item.faction}
        effectDesc={item.effectDesc}
        isDraggable={false}
      />
    </div>
  );
}

export default CustomDragLayer;

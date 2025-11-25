import { useEffect, useRef, useState } from "react"
import "./Energy.css"

export default function Energy({ value }) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const energyRef = useRef(null)

  useEffect(() => {
    if (!isTooltipOpen) return

    const handleOutsideClick = (event) => {
      if (energyRef.current && !energyRef.current.contains(event.target)) {
        setIsTooltipOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("touchstart", handleOutsideClick)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("touchstart", handleOutsideClick)
    }
  }, [isTooltipOpen])

  const toggleTooltip = () => setIsTooltipOpen((prev) => !prev)

  return (
    <div
      className="energy"
      onClick={toggleTooltip}
      aria-expanded={isTooltipOpen}
      aria-controls="energy-tooltip"
      aria-label="에너지 정보"
      ref={energyRef}
    >
      <div className="energy-value">{value}</div>
      <div
        id="energy-tooltip"
        className={`energy-tooltip ${isTooltipOpen ? "show" : ""}`}
        role="tooltip"
        aria-hidden={!isTooltipOpen}
      >
        <div className="energy-tooltip-title">에너지</div>
        <div className="energy-tooltip-text">
          카드를 내면 에너지를 소모합니다.
          <br />
          매 턴 에너지를 얻습니다. 
          <br />
          사용하지 않은 에너지는 사라집니다!
        </div>
      </div>
    </div>
  )
}
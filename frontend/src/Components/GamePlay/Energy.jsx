import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import "./Energy.css"

export default function Energy({ value }) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 })
  const energyRef = useRef(null)

  useEffect(() => {
    if (!isTooltipOpen) return

    const updateTooltipPosition = () => {
      const energyElement = energyRef.current
      if (!energyElement) return

      const rect = energyElement.getBoundingClientRect()
      setTooltipPosition({
        left: rect.left + rect.width / 2,
        top: rect.top
      })
    }

    updateTooltipPosition()
    window.addEventListener("resize", updateTooltipPosition)
    window.addEventListener("scroll", updateTooltipPosition, true)

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
      window.removeEventListener("resize", updateTooltipPosition)
      window.removeEventListener("scroll", updateTooltipPosition, true)
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

      {createPortal(
        <div
          id="energy-tooltip"
          className={`energy-tooltip ${isTooltipOpen ? "show" : ""}`}
          role="tooltip"
          aria-hidden={!isTooltipOpen}
          style={{
            left: `${tooltipPosition.left}px`,
            top: `${tooltipPosition.top}px`
          }}
        >
          <div className="energy-tooltip-title">에너지</div>
          <div className="energy-tooltip-text">
            카드를 내면 에너지를 소모합니다.
            <br />
            매 턴 에너지를 얻습니다.
            <br />
            사용하지 않은 에너지는 사라집니다!
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
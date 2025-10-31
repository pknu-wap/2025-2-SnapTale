import "./Energy.css"

export default function Energy({ value }) {
    return(
        <div className="energy">
          <div className="energy-value">{value}</div>
        </div>
    );
}
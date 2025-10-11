import './MatchingButton.css'
const Button = ({text, onClick, disabled}) => {
  return (
    <button 
    className= {`Matching ${disabled ? "disabled" : ""}`}  
    onClick = {onClick}
    disabled = {disabled}>
        {text}
    </button>
  );
};
export default Button;
import './MatchingButton.css'
const Button = ({text, onClick}) => {
  return (
    <button className = "Matching" onClick = {onClick}>
        {text}
    </button>
  );
};
export default Button;
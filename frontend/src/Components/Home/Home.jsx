import Button from "./Button"
import Profile from "./Profile";

const Home = () => {
  return (
    <div>
      <Profile/>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><Button text={"랜덤 매치"} /></li>
        <li><Button text={"친선전"} /></li>
        <li><Button text={"튜토리얼"} /></li>
      </ul>
    </div>
  );
};
export default Home;
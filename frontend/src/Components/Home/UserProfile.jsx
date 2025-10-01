import './userProfile.css';
import defaultUserProfile from "../../assets/userProfile.png";
/*유저 닉네임, 선택한 덱을 객체로 받아와서 반영할 생각중 */
const UserProfile = ({userName, profileImage}) => {
  return (
    <div class = "userProfile">
        <img
            src = {profileImage || defaultUserProfile} 
            alt= "User Profile" 
            width={56} 
            height={56}
        />
        <div className="userName">
            {userName}
        </div>
    </div>
    

  );
};
export default UserProfile;
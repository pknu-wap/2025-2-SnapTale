import profileIcon from "../../assets/userProfile.png";
/*추후에 덱 선택 아이콘으로 교체할 예정 */
const Profile = () => {
  return (
    <img
        src = {profileIcon} 
        alt= "Profile Icon" 
        width={55} 
        height={55}
    />
  );
};
export default Profile;
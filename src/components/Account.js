import { SignIn } from "./auth/SignIn";
import UserDetails from "./UserDetails";
import { UserFetch } from "./UserFetch";

const Account = ({ authUser }) => {
  return (
    <>
      {authUser ? null : <SignIn />}
      <UserDetails authUser={authUser} />
      {authUser ? <UserFetch authUser={authUser} /> : null}
    </>
  );
};

export default Account;

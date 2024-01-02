import { SignIn } from "./auth/SignIn";
import { UserFetch } from "./UserFetch";

const Account = ({ authUser }) => {
  return (
    <>
      {authUser ? null : <SignIn />}
      {authUser ? <UserFetch authUser={authUser} /> : null}
    </>
  );
};

export default Account;

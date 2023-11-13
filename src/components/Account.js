import { SignIn } from './auth/SignIn';
import UserDetails from './UserDetails';

import './Account.css';

const Account = ({ authUser }) => {
  return (
    <>
      {authUser ? null : <SignIn />}
      <UserDetails authUser={authUser} />
    </>
  );
};

export default Account;

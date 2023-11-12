import { SignIn } from './auth/SignIn';
import AuthDetails from './AuthDetails';
import UserDetails from './UserDetails';

import './Account.css';

const Account = ({ authUser }) => {
  return (
    <>
      {authUser ? null : <SignIn />}
      <AuthDetails authUser={authUser} />
      <UserDetails authUser={authUser} />
    </>
  );
};

export default Account;

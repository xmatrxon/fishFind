import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthDetails = ({ authUser }) => {
  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log('signed out succed');
      })
      .catch((error) => console.log(error));
  };

  return (
    <div>
      {authUser ? (
        <>
          <button onClick={userSignOut}>Sign Out</button>
        </>
      ) : null}
    </div>
  );
};

export default AuthDetails;

import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const history = useNavigate();
  signOut(auth)
    .then(() => {
      history('/');
    })
    .catch((error) => console.log(error));
};

export default Logout;

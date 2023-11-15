import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword, getAuth } from 'firebase/auth';

const ChangePassword = ({ authUser }) => {
  const [password, setPassword] = useState('');
  const auth = getAuth();
  const user = auth.currentUser;

  const history = useNavigate();

  const insertPassword = async () => {
    updatePassword(user, password)
      .then(() => {})
      .catch((err) => {
        console.log(err);
      });
    history('/account');
  };

  return (
    <>
      {authUser ? (
        <>
          <div className='center'>
            <h1>Podaj nowe hasło</h1>
            <form>
              <div className='txt_field'>
                <input
                  type='password'
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span></span>
                <label>Hasło</label>
              </div>
              <button onClick={insertPassword} className='signUp'>
                Ustaw
              </button>
            </form>
          </div>
        </>
      ) : null}
    </>
  );
};

export default ChangePassword;

import { useState } from 'react';
import { auth } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const history = useNavigate();

  const signUp = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      history('/account');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className='center'>
        <h1>Zarejestruj się</h1>
        <form>
          <div className='txt_field'>
            <input type='email' onChange={(e) => setEmail(e.target.value)} />
            <span></span>
            <label>Adres e-mail</label>
          </div>
          <div className='txt_field'>
            <input
              type='password'
              onChange={(e) => setPassword(e.target.value)}
            />
            <span></span>
            <label>Hasło</label>
          </div>
          <button onClick={signUp} className='signUp'>
            Zarejestruj się
          </button>
        </form>
      </div>
    </>
  );
};

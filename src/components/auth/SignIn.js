import { useState } from 'react';
import { auth } from '../../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link } from 'react-router-dom';

import '../Account.css';

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className='center'>
        <h1>Zaloguj</h1>
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
          <div className='pass'>
            <Link to='/reset' className='resetPassword'>
              Zapomnialeś hasła?
            </Link>
          </div>
          <button onClick={signIn} className='signIn'>
            Zaloguj
          </button>
          <div className='signup_link'>
            Nie masz konta? <Link to='/signup'>Zarejestruj się</Link>
          </div>
        </form>
      </div>
    </>
  );
};

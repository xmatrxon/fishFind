import { useState } from 'react';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const SetUsername = ({ authUser }) => {
  const [username, setUsername] = useState('');
  const usersCollectionRef = collection(db, 'users');

  const history = useNavigate();

  const insertUsername = async () => {
    await addDoc(usersCollectionRef, {
      UID: auth.currentUser.uid,
      username: username,
    });
    history('/account');
  };

  return (
    <>
      {authUser ? (
        <>
          <div className='center'>
            <h1>Ustaw nazwę użytkownika</h1>
            <form>
              <div className='txt_field'>
                <input
                  type='email'
                  onChange={(e) => setUsername(e.target.value)}
                />
                <span></span>
                <label>Nazwa użytkownika</label>
              </div>
              <button onClick={insertUsername} className='signUp'>
                Ustaw
              </button>
            </form>
          </div>
        </>
      ) : null}
    </>
  );
};

export default SetUsername;

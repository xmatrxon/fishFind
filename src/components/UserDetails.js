import { useState } from 'react';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';

const UserDetails = () => {
  const [username, setUsername] = useState('');
  const usersCollectionRef = collection(db, 'users');

  const insertUsername = async () => {
    await addDoc(usersCollectionRef, {
      UID: auth.currentUser.uid,
      username: username,
    });
  };

  return (
    <>
      <div>
        <h1>Username</h1>
        <input
          placeholder='Username'
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={insertUsername}>Apply</button>
      </div>
    </>
  );
};

export default UserDetails;

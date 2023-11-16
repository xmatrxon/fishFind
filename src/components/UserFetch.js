import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

import './UserDetails.css';

export const UserFetch = ({ authUser }) => {
  const [userData, setUserData] = useState(null);
  const history = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const q = query(
        collection(db, 'users'),
        where('UID', '==', auth.currentUser.uid)
      );

      try {
        const querySnapshot = await getDocs(q);
        const userData = [];
        querySnapshot.forEach((doc) => {
          userData.push({ id: doc.id, data: doc.data() });
        });
        setUserData(userData);
      } catch (err) {
        console.log(err);
      }
    };

    fetchUserData();
  }, []);

  const changeUsernamee = (id) => {
    history('/changeUsername', { state: { id: id } });
  };

  const handleClick = () => {
    history('/changePassword');
  };

  return (
    <>
      <div className='center'>
        <h1>Twoje dane</h1>
        <div className='changeData'>
          <p className='userDetails'>{`Adres email: ${authUser.email}`}</p>
        </div>
        {userData &&
          userData.map((user) => (
            <div key={user.id}>
              <p className='userDetails'>
                Nazwa użytkownika: {user.data.username}
              </p>
              <div className='changeDetails'>
                <button
                  onClick={() => {
                    changeUsernamee(user.id);
                  }}>
                  Zmień nazwę
                </button>
                <button
                  onClick={() => {
                    handleClick(user.id);
                  }}>
                  Zmień hasło
                </button>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

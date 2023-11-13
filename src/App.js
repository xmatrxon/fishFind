import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './components/Home';
import Map from './components/Map';
import Chat from './components/Chat';
import Account from './components/Account';
import { SignUp } from './components/auth/SignUp';
import { SignIn } from './components/auth/SignIn';
import Logout from './components/auth/Logout';
import ResetPassword from './components/ResetPassword';
import SetUsername from './components/SetUsername';

import { useEffect, useState } from 'react';

function App() {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        setAuthUser(null);
      }
    });

    return () => {
      listen();
    };
  }, []);

  return (
    <>
      <Navbar authUser={authUser} />
      <div className='container'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/map' element={<Map />} />
          <Route path='/chat' element={<Chat />} />
          <Route path='/account' element={<Account authUser={authUser} />} />
          <Route path='/signup' element={<SignUp authUser={authUser} />} />
          <Route path='/signin' element={<SignIn authUser={authUser} />} />
          <Route path='/reset' element={<ResetPassword />} />
          <Route path='/logout' element={<Logout />} />
          <Route
            path='/setUsername'
            element={<SetUsername authUser={authUser} />}
          />
        </Routes>
      </div>
    </>
  );
}

export default App;

import './App.css';
import { SignIn } from './components/auth/SignIn';
import { SignUp } from './components/auth/SignUp';
import AuthDetails from './components/AuthDetails';
import UserDetails from './components/UserDetails';

function App() {
  return (
    <div className='App'>
      <SignIn />
      <SignUp />
      <AuthDetails />
      <UserDetails />
    </div>
  );
}

export default App;

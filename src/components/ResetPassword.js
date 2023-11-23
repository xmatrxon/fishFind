import { sendPasswordResetEmail, getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const history = useNavigate();
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    sendPasswordResetEmail(auth, email)
      .then((data) => {
        alert("Sprawdź swoją skrzynkę pocztową");
        history("/signin");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <div className="center">
        <h1>Zresetuj hasło</h1>
        <form>
          <div className="txt_field">
            <input type="email" onChange={(e) => setEmail(e.target.value)} />
            <span></span>
            <label>Adres e-mail</label>
          </div>
          <button className="signUp" onClick={handleSubmit}>
            Zresetuj
          </button>
        </form>
      </div>
    </>
  );
};

export default ResetPassword;

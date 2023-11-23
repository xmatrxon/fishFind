import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db } from "../config/firebase";
import { doc, updateDoc } from "firebase/firestore";

const ChangeUsername = ({ authUser }) => {
  const [username, setUsername] = useState("");
  const { state } = useLocation();
  const { id } = state;

  const history = useNavigate();

  const insertUsername = async () => {
    const reff = doc(db, "users", id);
    updateDoc(reff, {
      username: username,
    })
      .then((response) => {
        console.log("updated");
      })
      .catch((err) => {
        console.log(err);
      });
    history("/account");
  };

  return (
    <>
      {authUser ? (
        <>
          <div className="center">
            <h1>Podaj nową nazwę użytkownika</h1>
            <form>
              <div className="txt_field">
                <input onChange={(e) => setUsername(e.target.value)} />
                <span></span>
                <label>Nazwa użytkownika</label>
              </div>
              <button onClick={insertUsername} className="signUp">
                Ustaw
              </button>
            </form>
          </div>
        </>
      ) : null}
    </>
  );
};

export default ChangeUsername;

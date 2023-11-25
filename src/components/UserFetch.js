import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const UserFetch = ({ authUser }) => {
  const [userData, setUserData] = useState(null);
  const history = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const q = query(
        collection(db, "users"),
        where("UID", "==", auth.currentUser.uid),
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
    history("/changeUsername", { state: { id: id } });
  };

  const handleClick = () => {
    history("/changePassword");
  };

  return (
    <>
      <div className="flex h-screen w-screen justify-center">
        <div className="w-2/5 self-center">
          <form className="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md">
            <h1 className="border-silver border-b-2 border-solid pb-4">
              Twoje dane
            </h1>
            <div>
              <p className="my-5 text-xl">{`Adres email: ${authUser.email}`}</p>
            </div>
            <div>
              {userData &&
                userData.map((user) => (
                  <div key={user.id}>
                    <p className="my-5 text-xl">
                      Nazwa użytkownika: {user.data.username}
                    </p>
                    <div>
                      <button
                        className="focus:shadow-outline mx-5 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                        onClick={() => {
                          changeUsernamee(user.id);
                        }}>
                        Zmień nazwę
                      </button>
                      <button
                        className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                        onClick={() => {
                          handleClick(user.id);
                        }}>
                        Zmień hasło
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

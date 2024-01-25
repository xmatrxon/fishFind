import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import UserIcon from "./UserIcon";
import { useLoading } from "./LoadingContext";
import Footer from "./Footer";

export const UserFetch = ({ authUser }) => {
  const [userData, setUserData] = useState(null);
  const { isLoading, setLoading } = useLoading();
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

  if (isLoading) {
    return (
      <>
        <div className="flex h-[calc(100vh-48px)] items-center justify-center">
          <p className="pr-3">Ładowanie </p>
          <svg
            className="-ml-1 mr-3 h-5 w-5 animate-spin text-black"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex h-screen w-full justify-center">
        <div className="w-2/5 self-center">
          <form className="mb-4 rounded bg-white px-8 pb-8 pt-6 shadow-md">
            <h1 className="border-silver border-b-2 border-solid pb-4">
              Twoje dane
            </h1>

            <div>
              {userData &&
                userData.map((user) => (
                  <div key={user.id}>
                    <div className="my-5 flex justify-center">
                      <UserIcon
                        width={48}
                        height={48}
                        iconColor={user.data.avatarColor}
                      />
                    </div>
                    <div>
                      <p className="my-5 text-xl">{`Adres email: ${authUser.email}`}</p>
                    </div>
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
      <Footer />
    </>
  );
};

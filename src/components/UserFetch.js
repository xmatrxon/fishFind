import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { useLoading } from "./LoadingContext";
import Footer from "./Footer";
import { Tooltip } from "react-tooltip";

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

  const handleFavourites = () => {
    history("/favourites");
  };

  const changeAvatar = (id, oldImageURL) => {
    history("/changeAvatar", { state: { id, oldImageURL } });
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
    <div className="userFetch">
      <div className="main-div">
        <div className="inner-div">
          <div className="content-div shadow-md">
            <h1 className="border-silver">Twoje dane</h1>

            <div className="data-div">
              {userData &&
                userData.map((user) => (
                  <div key={user.id}>
                    <div className="avatar-div">
                      <p className="">Avatar</p>
                      <div className="avatar-div__img">
                        {user.data.imageURL ? (
                          <img
                            src={user.data.imageURL}
                            alt="User avatar"
                            className="avatar-square"
                          />
                        ) : (
                          <img
                            src="https://firebasestorage.googleapis.com/v0/b/fishfind-2e78f.appspot.com/o/userImages%2FDefaultAvatar.png?alt=media&token=ecb71d3a-2b7e-4ac1-b770-9ce0fbf680f6"
                            alt="User avatar"
                            className="avatar-square"
                          />
                        )}
                        <button
                          aria-label="Change avatar"
                          className="cursor-pointer border-none bg-transparent text-left text-blue-500 underline"
                          onClick={() => {
                            changeAvatar(user.id, user.data.imageURL);
                          }}>
                          Zmień avatar
                        </button>
                      </div>
                    </div>
                    <div className="profil-details">
                      <div>
                        <p className="profil-details__p">Szczególy profilu</p>
                        <div className="email-div">
                          <div>
                            <p className="email-div__p">Adres email</p>
                            <div className="email-div__input">
                              <input
                                className="focus:shadow-outline  appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                                id="email"
                                type="text"
                                name="email"
                                aria-label="email"
                                value={authUser.email}
                                disabled
                              />
                            </div>
                          </div>
                        </div>
                        <p className="username__p">Nazwa użytkownika</p>
                        <Tooltip id="my-tooltip" className="z-10" />
                        <div className="username__input">
                          <input
                            className="focus:shadow-outline  appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                            id="username"
                            type="text"
                            name="username"
                            aria-label="username"
                            value={user.data.username}
                            disabled
                          />
                          <button
                            aria-label="Edit login button"
                            className="focus:shadow-outline rounded bg-blue-500 font-bold text-white hover:bg-blue-700 focus:outline-none"
                            onClick={() => {
                              changeUsernamee(user.id);
                            }}
                            data-tooltip-id="my-tooltip"
                            data-tooltip-content="Zmień nazwę użytkownika">
                            <div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="icon icon-tabler icon-tabler-edit"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round">
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                                <path d="M16 5l3 3" />
                              </svg>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="password-div">
                      <div>
                        <p className="password-div__p">Hasło</p>
                        <div className="password_input">
                          <input
                            className="focus:shadow-outline  borderleading-tight appearance-none rounded text-gray-700 shadow focus:outline-none"
                            id="password"
                            type="password"
                            name="password"
                            aria-label="password"
                            value="********"
                            disabled
                          />
                          <button
                            aria-label="Edit password button"
                            className="focus:shadow-outline rounded bg-blue-500 font-bold text-white hover:bg-blue-700 focus:outline-none"
                            onClick={() => {
                              handleClick(user.id);
                            }}
                            data-tooltip-id="my-tooltip"
                            data-tooltip-content="Zmień hasło">
                            <div>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="icon icon-tabler icon-tabler-edit"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="currentColor"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round">
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                                <path d="M16 5l3 3" />
                              </svg>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="favourites-div">
                      <button
                        aria-label="Favourites water button"
                        className="focus:shadow-outline rounded bg-blue-500 font-bold text-white hover:bg-blue-700 focus:outline-none"
                        onClick={() => {
                          handleFavourites();
                        }}>
                        <div className="favourites-button">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="icon icon-tabler icon-tabler-star"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
                          </svg>
                          <p>Twoje ulubione łowiska</p>
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

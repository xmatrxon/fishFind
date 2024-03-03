import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  endBefore,
  orderBy,
  limitToLast,
  getCountFromServer,
  startAfter,
  limit,
  arrayUnion,
  updateDoc,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { db, storage } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StrikeCallendar from "./StrikeCallendar";
import WaterEditPopup from "./WaterEditPopup";
import Footer from "./Footer";
import { Tooltip } from "react-tooltip";

import FishIcon from "./FishIcon";

const WaterDetails = ({ authUser }) => {
  const [allWaterData, setAllWaterData] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [usernameAddedWater, setUsernameAddedWater] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);

  const [lastDoc, setLastDoc] = useState(null);
  const [pageDown, setPageDown] = useState(0);
  const [pageBack, setPageBack] = useState(0);
  const [firstDoc, setFirstDoc] = useState(null);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [helper, setHelper] = useState(3);
  const [isFavourite, setIsFavoutire] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const history = useNavigate();
  const { waterId } = useParams();

  let modulo = null;

  const checkCommentsLength = async () => {
    const q = query(
      collection(db, "comments"),
      where("waterId", "==", +waterId),
    );

    try {
      const querySnapshot = await getCountFromServer(q);
      modulo = querySnapshot.data().count;
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (allWaterData.length > 0) {
      const userUID = allWaterData[0].data.UID;
      const matchedUser = allUsers.find((user) => user.data.UID === userUID);
      setUsernameAddedWater(matchedUser?.data.username || "");
    }
  }, [allWaterData, allUsers]);

  const fetchData = async () => {
    const q = query(collection(db, "markers"), where("id", "==", +waterId));

    try {
      const querySnapshot = await getDocs(q);
      const waterData = [];
      querySnapshot.forEach((doc) => {
        waterData.push({ id: doc.id, data: doc.data() });
      });
      setAllWaterData(waterData);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchUsers = async () => {
    const q = query(collection(db, "users"));

    try {
      const querySnapshot = await getDocs(q);
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, data: doc.data() });
      });
      setAllUsers(usersData);
    } catch (err) {
      console.log(err);
    }
  };

  const findUsername = (uid) => {
    const user = allUsers.find((user) => user.data.UID === uid);
    return user ? user.data.username : "Nieznany użytkownik";
  };

  const findUserDocId = (uid) => {
    const user = allUsers.find((user) => user.data.UID === uid);
    return user ? user.id : null;
  };

  const findAvatar = (uid) => {
    const user = allUsers.find((user) => user.data.UID === uid);
    return user && user.data.imageURL
      ? user.data.imageURL
      : "https://firebasestorage.googleapis.com/v0/b/fishfind-2e78f.appspot.com/o/userImages%2FDefaultAvatar.png?alt=media&token=ecb71d3a-2b7e-4ac1-b770-9ce0fbf680f6";
  };

  const findRole = (uid) => {
    const user = allUsers.find((user) => user.data.UID === uid);
    return user ? user.data.role : "Nieznana rola";
  };

  const fetchComments = async () => {
    await checkCommentsLength();

    try {
      let q = query(
        collection(db, "comments"),
        where("waterId", "==", +waterId),
        orderBy("date", "desc"),
        limit(3),
      );

      if (lastDoc) {
        q = query(
          collection(db, "comments"),
          where("waterId", "==", +waterId),
          orderBy("date", "desc"),
          startAfter(lastDoc),
          limit(3),
        );
      }

      const querySnapshot = await getDocs(q);
      const commentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: {
          ...doc.data(),
          date: doc.data().date.toDate().toLocaleDateString(),
        },
      }));

      setAllComments(commentsData);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setFirstDoc(querySnapshot.docs[0]);
      setHelper((prevHeler) => prevHeler + 3);
      setHasNextPage(querySnapshot.docs.length === 3);
      if (helper === modulo || modulo === 3) {
        setHasNextPage(false);
      }
      console.log("helper " + helper);
      console.log("modulo " + modulo);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    checkCommentsLength();
    fetchData();
    fetchUsers();
  }, []);

  useEffect(() => {
    checkCommentsLength();
    fetchComments();
  }, [pageDown]);

  useEffect(() => {
    checkIsFavouriteWater();
  }, [allUsers]);

  const handleNewComment = (event) => {
    setNewComment(event.target.value);
  };

  const closePopup = (data) => {
    setPopupVisible(data.value);
  };

  const handleEdit = () => {
    setPopupVisible(true);
  };

  const handleDelete = async () => {
    try {
      const waterIdToDelete = allWaterData[0].data.id;
      const waterNameToDelete = allWaterData[0].data.name;
      const imageURL = allWaterData[0].data.imageURL;

      const usersQuerySnapshot = await getDocs(
        query(
          collection(db, "users"),
          where("favouriteWater", "array-contains", {
            id: +waterIdToDelete,
            name: waterNameToDelete,
          }),
        ),
      );

      const usersToUpdate = usersQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));

      const updatePromises = usersToUpdate.map(async (user) => {
        const userRef = doc(collection(db, "users"), user.id);

        await updateDoc(userRef, {
          favouriteWater: arrayRemove({
            id: +waterIdToDelete,
            name: waterNameToDelete,
          }),
        });
      });
      await Promise.all(updatePromises);

      const markerId = allWaterData[0].id;
      await deleteDoc(doc(db, "markers", markerId));

      const storageRef = ref(storage, imageURL);
      await deleteObject(storageRef);

      const querySnapshot = await getDocs(
        query(
          collection(db, "comments"),
          where("waterId", "==", allWaterData[0].data.id),
        ),
      );

      if (!querySnapshot.empty) {
        const deletePromises = querySnapshot.docs.map(async (doc) => {
          await deleteDoc(doc.ref);
        });

        await Promise.all(deletePromises);
      }
      history("/dashboard");
    } catch (err) {
      console.log(err);
    }
  };

  const deleteComment = async (data) => {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "comments"), where("id", "==", data)),
      );

      if (!querySnapshot.empty) {
        const commentRef = querySnapshot.docs[0].ref;

        await deleteDoc(commentRef);

        history(0);
      } else {
        console.log("Komentarz nie znaleziony");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleForm = async (e) => {
    e.preventDefault();
    const markersCollectionRef = collection(db, "comments");

    try {
      await addDoc(markersCollectionRef, {
        id: Date.now(),
        waterId: +waterId,
        comment: newComment,
        UID: authUser.uid,
        date: serverTimestamp(),
      }).then(() => {
        setNewComment("");
        history(0);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const paginate = () => {
    setPageDown((prevPage) => prevPage + 1);
    setPageBack((prevPage) => prevPage + 1);
    setHasPrevPage(true);
  };

  const previous = async () => {
    if (pageBack <= 1) {
      setPageBack(0);
    } else {
      setPageBack((prevPage) => prevPage - 1);
    }
    const q = query(
      collection(db, "comments"),
      where("waterId", "==", +waterId),
      orderBy("date", "desc"),
      endBefore(firstDoc),
      limitToLast(3),
    );

    try {
      const querySnapshot = await getDocs(q);
      const commentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: {
          ...doc.data(),
          date: doc.data().date.toDate().toLocaleDateString(),
        },
      }));
      setAllComments(commentsData);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setFirstDoc(querySnapshot.docs[0]);
      setHelper((prevHeler) => prevHeler - 3);
      if (pageBack > 1) {
        setHasPrevPage(true);
      } else {
        setHasPrevPage(false);
      }
      setHasNextPage(true);
    } catch (err) {
      console.log(err);
    }
  };

  const addFavouriteWater = async () => {
    if (authUser) {
      const userDocId = findUserDocId(authUser.reloadUserInfo.localId);
      const reff = doc(db, "users", userDocId);
      const waterId = allWaterData[0].data.id;
      const waterName = allWaterData[0].data.name;
      if (isFavourite) {
        await updateDoc(reff, {
          favouriteWater: arrayRemove({ id: waterId, name: waterName }),
        });
        setIsFavoutire(false);
      } else {
        await updateDoc(reff, {
          favouriteWater: arrayUnion({ id: waterId, name: waterName }),
        });
      }
      history(0);
    } else {
      setErrorMessage("Musisz się zalogować aby to zrobić");
    }
  };

  const checkIsFavouriteWater = async () => {
    if (authUser) {
      const user = allUsers.find(
        (user) => user.data.UID === authUser.reloadUserInfo.localId,
      );

      if (user) {
        const favourite = user.data.favouriteWater.some(
          (water) => water.id === allWaterData[0].data.id,
        );
        if (favourite) {
          setIsFavoutire(true);
        }
      }
    }
  };

  return (
    <>
      {/* DIV NA CAŁĄ STRONĘ */}
      <div className="waterdetails">
        {allWaterData.length > 0 ? (
          <>
            {/* DIV NA NAZWĘ I DANE O LOKALIZACJI I KTO DODAŁ ŁOWISKO*/}
            <div className="every-div name-div">
              <p className="waterName">{allWaterData[0].data.name}</p>
              <div className="favourites-div">
                <button
                  aria-label="Manage favourite"
                  onClick={addFavouriteWater}>
                  <Tooltip id="my-tooltip" className="z-10" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-star"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke={`${isFavourite ? "yellow" : "currentColor"}`}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content={`${
                      isFavourite
                        ? "Usuń łowisko z ulubionych"
                        : "Dodaj łowisko do ulubionych"
                    }`}>
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" />
                  </svg>
                </button>
              </div>
              {errorMessage ? (
                <div
                  className="error-div bg-red-100text-red-700 relative rounded border border-red-400"
                  role="alert">
                  <span className="block text-red-500 sm:inline">
                    {errorMessage}
                  </span>
                  <span className="error-span absolute bottom-0 right-0 top-0">
                    <svg
                      className="h-6 w-6 fill-current text-red-500"
                      role="button"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      onClick={() => setErrorMessage("")}>
                      <title>Zamknij</title>
                      <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                    </svg>
                  </span>
                </div>
              ) : null}

              <div className="location-div">
                {allWaterData[0].data.city ? (
                  <span>{allWaterData[0].data.city}, </span>
                ) : (
                  <span>Miasto, </span>
                )}

                <span>{allWaterData[0].data.voivodeship.label}</span>
              </div>
              <p className="owner">Dodał łowisko: {usernameAddedWater}</p>
              {/* DIV NA PRZYCISKI DO EDYCJI */}
              {authUser && authUser.uid ? (
                <div className="admin-buttons">
                  {(allWaterData[0] && findRole(authUser.uid) === "admin") ||
                  authUser.uid === allWaterData[0].data.UID ? (
                    <button
                      aria-label="Edit water"
                      onClick={handleEdit}
                      className="focus:shadow-outline rounded bg-blue-500 font-bold text-white hover:bg-blue-700 focus:outline-none">
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
                        strokeLinejoin="round"
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content="Edytuj łowisko">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                        <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                        <path d="M16 5l3 3" />
                      </svg>
                    </button>
                  ) : null}
                  {findRole(authUser.uid) === "admin" ? (
                    <button
                      aria-label="Delete water"
                      onClick={handleDelete}
                      className="focus:shadow-outline rounded bg-red-500 font-bold text-white hover:bg-red-700 focus:outline-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="icon icon-tabler icon-tabler-trash"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content="Usuń łowisko">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M4 7l16 0" />
                        <path d="M10 11l0 6" />
                        <path d="M14 11l0 6" />
                        <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                        <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                      </svg>
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* DIV NA ZDJECIE */}
            <div className="img-div every-div">
              <img
                src={
                  allWaterData[0].data.imageURL
                    ? allWaterData[0].data.imageURL
                    : "https://placehold.co/600x400"
                }
                alt="Zdjęcia łowiska"
              />
            </div>

            {/* DIV NA OPIS ŁOWISKA */}
            <div className="desc-div every-div">
              <p className="desc">Opis łowiska:</p>
              <p>{allWaterData[0].data.description}</p>
            </div>

            {/* DIV NA REGULAMIN I JAKIE RYBY NA ŁOWISKU */}
            <div className="fish-div every-div">
              <p className="fish-text">Ryby występujące na łowisku:</p>
              <div className="fish-container">
                {allWaterData[0].data.fish.map((fish) => (
                  <div className="fishIcon" key={fish.label}>
                    <FishIcon width={24} height={24} iconColor={"black"} />
                    <p>{fish.label}</p>
                  </div>
                ))}
              </div>
              <p className="rules">Regulamin łowiska:</p>
              <p>{allWaterData[0].data.rules}</p>
            </div>

            {/* DIV NA KALENDARZ BRAŃ */}
            <div className="every-div strCallendar">
              <StrikeCallendar
                lat={allWaterData[0].data.lat}
                lon={allWaterData[0].data.lon}
              />
            </div>

            {/* DIV NA KOMENATRZE */}
            <div className="comment-div">
              <p className="comment-section">Sekcja komentarzy</p>
              {allComments.map((comment) => (
                <div key={comment.data.id} className="comment-block">
                  {/* DIV NA AVATR I NICK */}
                  <div className="user-div">
                    <div>
                      <img
                        src={findAvatar(comment.data.UID)}
                        alt="Avatar użytkownika"
                      />
                    </div>
                    <div>
                      <p>{findUsername(comment.data.UID)} </p>
                    </div>
                  </div>
                  {/* DIV NA KOMENTARZ DATE I DELETEBUTTON */}
                  <div className="comment-info">
                    {/* DIV NA DATE */}
                    <div className="date">
                      <p>Data: {comment.data.date}</p>
                    </div>
                    {/* DIV NA KOMENTARZ */}
                    <div>
                      <p className="comment">{comment.data.comment}</p>
                    </div>
                    {/* DIV NA BUTTON */}
                    <div className="delete-button-div">
                      {authUser && findRole(authUser.uid) === "admin" ? (
                        <div>
                          <button
                            aria-label="Delete comment"
                            onClick={() => deleteComment(comment.data.id)}
                            className="focus:shadow-outline rounded bg-red-500 font-bold text-white hover:bg-red-700 focus:outline-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="icon icon-tabler icon-tabler-trash"
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              data-tooltip-id="my-tooltip"
                              data-tooltip-content="Usuń komentarz">
                              <path
                                stroke="none"
                                d="M0 0h24v24H0z"
                                fill="none"
                              />
                              <path d="M4 7l16 0" />
                              <path d="M10 11l0 6" />
                              <path d="M14 11l0 6" />
                              <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                              <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                            </svg>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              {allComments.length > 0 ? (
                <div className="pagination-div">
                  <button
                    aria-label="Prev page"
                    onClick={previous}
                    className={`mx-1 rounded bg-blue-500 text-white focus:outline-none ${
                      hasPrevPage ? "" : "cursor-not-allowed opacity-50"
                    }`}
                    disabled={!hasPrevPage}>
                    Poprzednia strona
                  </button>
                  <button
                    aria-label="Next page"
                    onClick={paginate}
                    className={`mx-1 rounded bg-blue-500 text-white focus:outline-none ${
                      hasNextPage ? "" : "cursor-not-allowed opacity-50"
                    }`}
                    disabled={!hasNextPage}>
                    Następna strona
                  </button>
                </div>
              ) : null}
              {authUser ? (
                <div className="add-comment-div">
                  <form>
                    <div className="form-div">
                      <label className="text-gray-700">Dodaj komentarz</label>
                      <div>
                        <textarea
                          className="focus:shadow-outline appearance-none rounded border leading-tight text-gray-700 shadow focus:outline-none"
                          id="comment"
                          type="text"
                          placeholder="Komentarz"
                          rows="2"
                          name="comment"
                          onChange={handleNewComment}
                        />
                        <button
                          aria-label="Add"
                          onClick={handleForm}
                          className="focus:shadow-outline rounded bg-blue-500 font-bold text-white hover:bg-blue-700 focus:outline-none">
                          Dodaj
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <p className="login-info">
                  Aby dodać komentarz należy być zalogowanym użytkownikiem
                </p>
              )}
            </div>

            <WaterEditPopup
              trigger={popupVisible}
              setTrigger={setPopupVisible}
              waterId={allWaterData[0].id}
              pass={closePopup}
            />
          </>
        ) : (
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
        )}
      </div>
      <Footer />
    </>
  );
};

export default WaterDetails;

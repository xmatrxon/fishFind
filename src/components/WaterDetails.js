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
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import StrikeCallendar from "./StrikeCallendar";
import UserIcon from "./UserIcon";
import WaterEditPopup from "./WaterEditPopup";
import Footer from "./Footer";

const WaterDetails = ({ authUser }) => {
  const [allWaterData, setAllWaterData] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [usernameAddedWater, setUsernameAddedWater] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);

  const [lastDoc, setLastDoc] = useState(null);
  const [pageDown, setPageDown] = useState(0);
  const [pageBack, setPageBack] = useState(0);
  const [firstDoc, setFirstDoc] = useState(null);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [helper, setHelper] = useState(0);

  const firstRender = useRef(true);

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

  const findRole = (uid) => {
    const user = allUsers.find((user) => user.data.UID === uid);
    return user ? user.data.role : "Nieznana rola";
  };

  const findColor = (uid) => {
    const user = allUsers.find((user) => user.data.UID === uid);
    return user ? user.data.avatarColor : "Nieznany użytkownik";
  };

  const fetchComments = async () => {
    await checkCommentsLength();

    const q = query(
      collection(db, "comments"),
      where("waterId", "==", +waterId),
      orderBy("date"),
      startAfter(lastDoc),
      limit(3),
    );

    try {
      const querySnapshot = await getDocs(q);
      const commentsData = [];
      querySnapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, data: doc.data() });
      });
      setAllComments(commentsData);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setFirstDoc(querySnapshot.docs[0]);
      setHelper((prevHeler) => prevHeler + 3);
      setHasNextPage(querySnapshot.docs.length === 3);
      if (helper === modulo || modulo === 3) {
        setHasNextPage(false);
      }
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
      const markerId = allWaterData[0].id;
      await deleteDoc(doc(db, "markers", markerId));

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
      } else {
        console.log("Nie znaleziono komentarzy");
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

    const currentDate = new Date();

    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const year = currentDate.getFullYear();

    const formattedDate = `${day}-${month}-${year}`;

    try {
      await addDoc(markersCollectionRef, {
        id: Date.now(),
        waterId: +waterId,
        comment: newComment,
        UID: authUser.uid,
        date: formattedDate,
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
      orderBy("date"),
      endBefore(firstDoc),
      limitToLast(3),
    );

    try {
      const querySnapshot = await getDocs(q);
      const commentsData = [];
      querySnapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, data: doc.data() });
      });
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

  return (
    <>
      <div className="flex flex-col justify-center">
        {allWaterData.length > 0 ? (
          <>
            <div>
              <p>Nazwa łowiska: {allWaterData[0].data.name}</p>
              <p>Województwo: {allWaterData[0].data.voivodeship.label}</p>
              <p>Opis łowiska: {allWaterData[0].data.description}</p>
              <p>Regulamin łowiska: {allWaterData[0].data.rules}</p>
              <p>
                Ryby występujące na łowisku:
                {allWaterData[0].data.fish.map((fish) => fish.label).join(", ")}
              </p>

              <p>Dodał łowisko: {usernameAddedWater}</p>
              {findRole(authUser.uid) == "admin" ||
              authUser.uid == allWaterData[0].data.UID ? (
                <button
                  onClick={handleEdit}
                  className="focus:shadow-outline mb-6 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none">
                  Edytuj
                </button>
              ) : null}
              {findRole(authUser.uid) == "admin" ? (
                <button
                  onClick={handleDelete}
                  className="focus:shadow-outline mb-6 ml-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none">
                  Usuń
                </button>
              ) : null}
              {allComments.map((comment) => (
                <div
                  key={comment.data.id}
                  className="flex flex-col justify-center bg-white">
                  <div>
                    <p>Comment: {comment.data.comment}</p>
                  </div>
                  <div>
                    <p>Data: {comment.data.date}</p>
                  </div>
                  <div>
                    <p>Username: {findUsername(comment.data.UID)} </p>
                  </div>
                  {findRole(authUser.uid) == "admin" ? (
                    <div>
                      <button
                        onClick={() => deleteComment(comment.data.id)}
                        className="focus:shadow-outline mb-6 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none">
                        Usuń komentarz
                      </button>
                    </div>
                  ) : null}

                  <div className="flex justify-center">
                    <UserIcon
                      width={24}
                      height={24}
                      iconColor={findColor(comment.data.UID)}
                    />
                  </div>
                </div>
              ))}
              <p>Brania na łowisku</p>
              <div className="flex justify-center">
                {/* <StrikeCallendar
                  lat={allWaterData[0].data.lat}
                  lon={allWaterData[0].data.lon}
                /> */}
              </div>
            </div>
            {authUser ? (
              <div>
                <form>
                  <div className="mb-4 pt-6">
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                      Dodaj komentarz
                    </label>
                    <input
                      className="focus:shadow-outline w-1/4 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                      id="comment"
                      type="text"
                      placeholder="Komentarz"
                      name="comment"
                      onChange={handleNewComment}
                    />
                  </div>
                  <div>
                    <button
                      onClick={handleForm}
                      className="focus:shadow-outline mb-6 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none">
                      Dodaj
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <p>Aby dodać komentarz należy być zalogowanym</p>
            )}
            {allComments.length > 0 ? (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={previous}
                  className={`mx-1 rounded bg-blue-500 px-3 py-1 text-white focus:outline-none ${
                    hasPrevPage ? "" : "cursor-not-allowed opacity-50"
                  }`}
                  disabled={!hasPrevPage}>
                  Poprzednia strona
                </button>
                <button
                  onClick={paginate}
                  className={`mx-1 rounded bg-blue-500 px-3 py-1 text-white focus:outline-none ${
                    hasNextPage ? "" : "cursor-not-allowed opacity-50"
                  }`}
                  disabled={!hasNextPage}>
                  Następna strona
                </button>
              </div>
            ) : null}

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

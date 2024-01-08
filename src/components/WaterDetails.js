import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StrikeCallendar from "./StrikeCallendar";
import UserIcon from "./UserIcon";

const WaterDetails = ({ authUser }) => {
  const [allWaterData, setAllWaterData] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [usernameAddedWater, setUsernameAddedWater] = useState("");

  const history = useNavigate();
  const { waterId } = useParams();

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

  const findColor = (uid) => {
    const user = allUsers.find((user) => user.data.UID === uid);
    return user ? user.data.avatarColor : "Nieznany użytkownik";
  };

  const fetchComments = async () => {
    const q = query(
      collection(db, "comments"),
      where("waterId", "==", +waterId),
    );

    try {
      const querySnapshot = await getDocs(q);
      const commentsData = [];
      querySnapshot.forEach((doc) => {
        commentsData.push({ id: doc.id, data: doc.data() });
      });
      setAllComments(commentsData);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
    fetchComments();
  }, []);

  const handleNewComment = (event) => {
    setNewComment(event.target.value);
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
                <StrikeCallendar
                  lat={allWaterData[0].data.lat}
                  lon={allWaterData[0].data.lon}
                />
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
    </>
  );
};

export default WaterDetails;

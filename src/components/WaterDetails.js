import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StrikeCallendar from "./StrikeCallendar";

const WaterDetails = ({ authUser }) => {
  const [allWaterData, setAllWaterData] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const { waterId } = useParams();

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
    fetchComments();
  }, [waterId]);

  const handleNewComment = (event) => {
    setNewComment(event.target.value);
  };

  const handleForm = async () => {
    const markersCollectionRef = collection(db, "comments");

    try {
      await addDoc(markersCollectionRef, {
        id: Date.now(),
        waterId: waterId,
        comment: newComment,
      }).then(() => {
        setNewComment("");
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
              <p>Lat: {allWaterData[0].data.lat}</p>
              <p>Lon: {allWaterData[0].data.lon}</p>
              {allComments.map((comment) => (
                <div key={comment.data.id} className=" bg-white">
                  <p>Comment: {comment.data.comment}</p>
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
                <form className="">
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
                      className="focus:shadow-outline mb-6 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                      onClick={handleForm}>
                      Dodaj
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <p>Ładowanie...</p>
            <p>{waterId}</p>
          </>
        )}
      </div>
    </>
  );
};

export default WaterDetails;

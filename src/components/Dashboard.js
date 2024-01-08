import { useState, useEffect } from "react";
import Select from "react-select";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  startAfter,
  orderBy,
  endBefore,
  limitToLast,
  startAt,
  endAt,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Link } from "react-router-dom";
import WaterDetails from "./WaterDetails";
import { voivodeshipList } from "../voivodeshipList";
import { fishList } from "../fishList";
import FishIcon from "./FishIcon";

const Dashboard = () => {
  const [name, setName] = useState("");
  const [voivodeship, setVoivodeship] = useState("");
  const [fish, setFish] = useState("");
  const [allWaterData, setAllWaterData] = useState([]);

  const [lastDoc, setLastDoc] = useState(null);
  const [pageDown, setPageDown] = useState(0);
  const [pageBack, setPageBack] = useState(0);
  const [firstDoc, setFirstDoc] = useState(null);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [modulo, setModulo] = useState(null);
  const [helper, setHelper] = useState(0);
  const [isClickedDeatailsButton, setIsClickedDetailsButton] = useState(false);
  const [detailsId, setDetailsId] = useState(null);

  const checkMakersLength = async () => {
    const q = query(collection(db, "markers"));

    try {
      const querySnapshot = await getDocs(q);
      setModulo(querySnapshot.docs.length);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    checkMakersLength();
  }, []);

  const clickHandler = async (e) => {
    e.preventDefault();

    let q = null;

    if (name && !voivodeship && !fish) {
      const endName =
        name.slice(0, -1) +
        String.fromCharCode(name.charCodeAt(name.length - 1) + 1);
      q = query(
        collection(db, "markers"),
        where("name", ">=", name),
        where("name", "<", endName),
        orderBy("name"),
      );
    } else if (voivodeship && !name && !fish) {
      q = query(
        collection(db, "markers"),
        where("voivodeship", "==", voivodeship),
        orderBy("name"),
      );
    } else if (fish && !name && !voivodeship) {
      q = query(
        collection(db, "markers"),
        where("fish", "array-contains-any", fish),
        orderBy("name"),
      );
    } else if (name && voivodeship && !fish) {
      q = query(
        collection(db, "markers"),
        where("name", "==", name),
        where("voivodeship", "==", voivodeship),
        orderBy("name"),
      );
    } else if (name && fish && !voivodeship) {
      q = query(
        collection(db, "markers"),
        where("name", "==", name),
        where("fish", "array-contains-any", fish),
        orderBy("name"),
      );
    } else if (fish && voivodeship && !name) {
      q = query(
        collection(db, "markers"),
        where("voivodeship", "==", voivodeship),
        where("fish", "array-contains-any", fish),
        orderBy("name"),
      );
    } else if (name && fish && voivodeship) {
      q = query(
        collection(db, "markers"),
        where("name", "==", name),
        where("voivodeship", "==", voivodeship),
        where("fish", "array-contains-any", fish),
        orderBy("name"),
      );
    }

    try {
      const querySnapshot = await getDocs(q);
      const waterData = [];
      querySnapshot.forEach((doc) => {
        waterData.push({ id: doc.id, data: doc.data() });
      });

      setAllWaterData(waterData);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setFirstDoc(querySnapshot.docs[0]);
      setHelper((prevHeler) => prevHeler + 5);
      setHasNextPage(querySnapshot.docs.length === 5);
      if (helper === modulo) {
        setHasNextPage(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const allWaters = async () => {
    const q = query(
      collection(db, "markers"),
      orderBy("name"),
      startAfter(lastDoc),
      limit(5),
    );

    try {
      const querySnapshot = await getDocs(q);
      const waterData = [];
      querySnapshot.forEach((doc) => {
        waterData.push({ id: doc.id, data: doc.data() });
      });

      setAllWaterData(waterData);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setFirstDoc(querySnapshot.docs[0]);
      setHelper((prevHeler) => prevHeler + 5);
      setHasNextPage(querySnapshot.docs.length === 5);
      if (helper === modulo) {
        setHasNextPage(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    allWaters();
  }, [pageDown]);

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
      collection(db, "markers"),
      orderBy("name"),
      endBefore(firstDoc),
      limitToLast(5),
    );

    try {
      const querySnapshot = await getDocs(q);
      const waterData = [];
      querySnapshot.forEach((doc) => {
        waterData.push({ id: doc.id, data: doc.data() });
      });
      setAllWaterData(waterData);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setFirstDoc(querySnapshot.docs[0]);
      setHelper((prevHeler) => prevHeler - 5);

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

  const handleVoivodeship = (data) => {
    setVoivodeship(data);
  };

  const handleFish = (data) => {
    setFish(data);
  };

  const handleDetailsButton = (data) => {
    setIsClickedDetailsButton(true);
    setDetailsId(data);
  };

  const capitalizeFirstLetter = (input) => {
    return input.charAt(0).toUpperCase() + input.slice(1);
  };

  return (
    <>
      {isClickedDeatailsButton ? (
        <WaterDetails waterId={detailsId} />
      ) : (
        <div className="flex h-screen w-screen items-center justify-center overflow-auto">
          <div className=" mt-20 h-3/4 w-9/12 rounded-lg bg-white">
            <div>
              <form className="border-silver mb-10 flex w-full flex-wrap rounded border-b-2 border-solid bg-white pt-6">
                <div className="mb-6 ml-16 flex w-full">
                  <input
                    className="focus:shadow-outline mr-10 w-4/12 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                    id="name"
                    type="text"
                    placeholder="Nazwa łowiska"
                    name="name"
                    onChange={(e) =>
                      setName(capitalizeFirstLetter(e.target.value))
                    }
                  />
                  <Select
                    className="mr-10 w-3/12"
                    options={voivodeshipList}
                    placeholder="Województwo"
                    value={voivodeship}
                    onChange={handleVoivodeship}
                    isMulti={false}
                  />
                  <Select
                    className="mr-10"
                    options={fishList}
                    placeholder="Występujące ryby"
                    value={fish}
                    onChange={handleFish}
                    isMulti
                  />
                  <button
                    className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                    onClick={clickHandler}>
                    Szukaj
                  </button>
                </div>
              </form>
            </div>
            <div className="px-10">
              {allWaterData.length > 0 ? (
                allWaterData.map((water) => (
                  <div
                    key={water.data.id}
                    className="mb-5 flex h-full justify-between rounded-lg bg-purple-300 px-10 py-3">
                    <div className="w-full">
                      <p>{water.data.name}</p>
                      <div className="flex w-full">
                        <FishIcon
                          height={24}
                          width={24}
                          iconColor={"currentColor"}
                        />
                        {Array.isArray(water.data.fish) && (
                          <p>
                            {water.data.fish
                              .map((fish) => fish.label)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <Link
                      className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                      to={`/dashboard/${water.data.id}`}>
                      Szczegóły
                    </Link>
                  </div>
                ))
              ) : (
                <p>Brak łowisk</p>
              )}
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;

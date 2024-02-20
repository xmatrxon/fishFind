import { useState, useEffect } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
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
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Link } from "react-router-dom";
import { voivodeshipList } from "../voivodeshipList";
import { fishList } from "../fishList";
import FishIcon from "./FishIcon";
import Footer from "./Footer";

const animatedComponents = makeAnimated();

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
  const [helper2, setHelper2] = useState(5);
  const [isSearchEmpty, setIsSearchEmpty] = useState(true);
  const [isSearching, setIsSearching] = useState(true);
  const [loading, setIsLoading] = useState(true);

  let mm = null;

  const checkMakersLength = async () => {
    const q = query(collection(db, "markers"));

    try {
      const querySnapshot = await getCountFromServer(q);
      setModulo(querySnapshot.data().count);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    checkMakersLength();
  }, []);

  useEffect(() => {
    if (allWaterData.length > 0) {
      setIsLoading(false);
    }
  }, [allWaterData]);

  useEffect(() => {
    if (isSearching) {
      setLastDoc(null);
      setHelper2(5);
      setHasPrevPage(false);
      setPageBack(0);
      setIsSearching(false);
    }
  }, [name, voivodeship, fish]);

  let q = query(collection(db, "markers"));
  const clickHandler = async (e) => {
    if (e) {
      e.preventDefault();
    }
    if (!isSearching) {
      setHasPrevPage(null);
      setHasNextPage(null);
      setIsSearching(true);
    }
    setLastDoc(null);
    if (name && !voivodeship && (!fish || fish.length === 0)) {
      const endName =
        name.slice(0, -1) +
        String.fromCharCode(name.charCodeAt(name.length - 1) + 1);
      q = query(
        collection(db, "markers"),
        where("name", ">=", name),
        where("name", "<", endName),
        orderBy("name"),
      );
      setIsSearching(true);
    } else if (voivodeship && !name && (!fish || fish.length === 0)) {
      q = query(
        collection(db, "markers"),
        where("voivodeship", "==", voivodeship),
        orderBy("name"),
      );
      setIsSearching(true);
    } else if (fish.length > 0 && !name && !voivodeship) {
      q = query(
        collection(db, "markers"),
        where("fish", "array-contains-any", fish),
        orderBy("name"),
      );
      setIsSearching(true);
    } else if (name && voivodeship && (!fish || fish.length === 0)) {
      const endName =
        name.slice(0, -1) +
        String.fromCharCode(name.charCodeAt(name.length - 1) + 1);
      q = query(
        collection(db, "markers"),
        where("name", ">=", name),
        where("name", "<", endName),
        where("voivodeship", "==", voivodeship),
        orderBy("name"),
      );
      setIsSearching(true);
    } else if (name && fish.length > 0 && !voivodeship) {
      const endName =
        name.slice(0, -1) +
        String.fromCharCode(name.charCodeAt(name.length - 1) + 1);
      q = query(
        collection(db, "markers"),
        where("name", ">=", name),
        where("name", "<", endName),
        where("fish", "array-contains-any", fish),
        orderBy("name"),
      );
      setIsSearching(true);
    } else if (fish.length > 0 && voivodeship && !name) {
      q = query(
        collection(db, "markers"),
        where("voivodeship", "==", voivodeship),
        where("fish", "array-contains-any", fish),
        orderBy("name"),
      );
      setIsSearching(true);
    } else if (name && fish.length > 0 && voivodeship) {
      const endName =
        name.slice(0, -1) +
        String.fromCharCode(name.charCodeAt(name.length - 1) + 1);
      q = query(
        collection(db, "markers"),
        where("name", ">=", name),
        where("name", "<", endName),
        where("voivodeship", "==", voivodeship),
        where("fish", "array-contains-any", fish),
        orderBy("name"),
      );
      setIsSearching(true);
    } else if (!name && !voivodeship && (!fish || fish.length === 0)) {
      q = query(collection(db, "markers"), orderBy("name"));
      setIsSearching(true);
    }

    if (lastDoc != null && isSearchEmpty === false) {
      let querySnapshot = await getCountFromServer(q);
      mm = querySnapshot.data().count;
      q = query(q, startAfter(lastDoc), limit(5));
    } else {
      let querySnapshot = await getCountFromServer(q);
      mm = querySnapshot.data().count;
      q = query(q, limit(5));
      setPageBack(0);
      setHasPrevPage(null);
      setHasNextPage(null);
    }

    try {
      let querySnapshot = await getDocs(q);
      const waterData = [];
      querySnapshot.forEach((doc) => {
        waterData.push({ id: doc.id, data: doc.data() });
      });

      setIsSearchEmpty(false);
      setAllWaterData(waterData);
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setFirstDoc(querySnapshot.docs[0]);
      setHelper2((prevHeler) => prevHeler + 5);
      setHasNextPage(querySnapshot.docs.length === 5);

      if (waterData.length < 1) {
        setHasNextPage(null);
        setHasNextPage(null);
        setPageBack(0);
      }

      if (helper2 === mm) {
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
    if (isSearchEmpty) {
      allWaters();
    } else {
      clickHandler();
    }
  }, [pageDown]);

  const paginate = () => {
    if (isSearchEmpty) {
      setIsSearching(false);
    }

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

    let q;

    if (isSearching) {
      if (name && !voivodeship && (!fish || fish.length === 0)) {
        const endName =
          name.slice(0, -1) +
          String.fromCharCode(name.charCodeAt(name.length - 1) + 1);
        q = query(
          collection(db, "markers"),
          where("name", ">=", name),
          where("name", "<", endName),
          orderBy("name"),
          endBefore(firstDoc),
          limitToLast(5),
        );
        setIsSearching(true);
      } else if (voivodeship && !name && (!fish || fish.length === 0)) {
        q = query(
          collection(db, "markers"),
          where("voivodeship", "==", voivodeship),
          orderBy("name"),
          endBefore(firstDoc),
          limitToLast(5),
        );
        setIsSearching(true);
      } else if (fish.length > 0 && !name && !voivodeship) {
        q = query(
          collection(db, "markers"),
          where("fish", "array-contains-any", fish),
          orderBy("name"),
          endBefore(firstDoc),
          limitToLast(5),
        );
        setIsSearching(true);
      } else if (name && voivodeship && (!fish || fish.length === 0)) {
        const endName =
          name.slice(0, -1) +
          String.fromCharCode(name.charCodeAt(name.length - 1) + 1);
        q = query(
          collection(db, "markers"),
          where("name", ">=", name),
          where("name", "<", endName),
          where("voivodeship", "==", voivodeship),
          orderBy("name"),
          endBefore(firstDoc),
          limitToLast(5),
        );
        setIsSearching(true);
      } else if (name && fish.length > 0 && !voivodeship) {
        const endName =
          name.slice(0, -1) +
          String.fromCharCode(name.charCodeAt(name.length - 1) + 1);
        q = query(
          collection(db, "markers"),
          where("name", ">=", name),
          where("name", "<", endName),
          where("fish", "array-contains-any", fish),
          orderBy("name"),
          endBefore(firstDoc),
          limitToLast(5),
        );
        setIsSearching(true);
      } else if (fish.length > 0 && voivodeship && !name) {
        q = query(
          collection(db, "markers"),
          where("voivodeship", "==", voivodeship),
          where("fish", "array-contains-any", fish),
          orderBy("name"),
          endBefore(firstDoc),
          limitToLast(5),
        );
        setIsSearching(true);
      } else if (name && fish.length > 0 && voivodeship) {
        const endName =
          name.slice(0, -1) +
          String.fromCharCode(name.charCodeAt(name.length - 1) + 1);
        q = query(
          collection(db, "markers"),
          where("name", ">=", name),
          where("name", "<", endName),
          where("voivodeship", "==", voivodeship),
          where("fish", "array-contains-any", fish),
          orderBy("name"),
          endBefore(firstDoc),
          limitToLast(5),
        );
        setIsSearching(true);
      } else if (!name && !voivodeship && (!fish || fish.length === 0)) {
        q = query(
          collection(db, "markers"),
          orderBy("name"),
          endBefore(firstDoc),
          limitToLast(5),
        );
        setIsSearching(true);
      }
    } else {
      q = query(
        collection(db, "markers"),
        orderBy("name"),
        endBefore(firstDoc),
        limitToLast(5),
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
      setHelper((prevHeler) => prevHeler - 5);
      setHelper2((prevHeler) => prevHeler - 5);

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

  const capitalizeFirstLetter = (input) => {
    return input.charAt(0).toUpperCase() + input.slice(1);
  };

  if (loading) {
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
    <div className="dashboard">
      <div className="header">
        <h1 className="header__heading ">Wyszukiwarka łowisk</h1>
        <p className="header__text">
          Skorzystaj z naszej wyszukiwarki łowisk. Możesz wyszukiwać po nazwie
          łowiska, województwie lub też po występujących rybach na łowisku.
        </p>
        <div className="white-block white-block-left"></div>
      </div>
      <div className="content-div">
        <div className="inner-div">
          <form className="border-silver">
            <div className="input-div">
              <input
                className="focus:shadow-outline appearance-none rounded border leading-tight text-gray-700 shadow focus:outline-none"
                id="name"
                type="text"
                placeholder="Nazwa łowiska"
                name="name"
                onChange={(e) => setName(capitalizeFirstLetter(e.target.value))}
              />
              <Select
                className="voivodeship-select"
                options={voivodeshipList}
                placeholder="Województwo"
                value={voivodeship}
                onChange={handleVoivodeship}
                isMulti={false}
                isClearable={true}
              />
              <Select
                className="fish-select"
                options={fishList}
                placeholder="Występujące ryby"
                value={fish}
                onChange={handleFish}
                isMulti
                components={animatedComponents}
              />
              <button
                className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                onClick={clickHandler}
                disabled={isSearching}>
                Szukaj
              </button>
            </div>
          </form>

          <div className="results-div">
            {allWaterData.length > 0 ? (
              allWaterData.map((water) => (
                <div key={water.data.id} className="water-div">
                  <div className="data-div">
                    <p className="water-name">{water.data.name}</p>
                    <div className="fish-div">
                      <FishIcon
                        height={24}
                        width={24}
                        iconColor={"currentColor"}
                      />
                      {Array.isArray(water.data.fish) && (
                        <p>
                          {water.data.fish.map((fish) => fish.label).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    className="water-link focus:shadow-outline flex items-center justify-center rounded bg-blue-500 font-bold text-white hover:bg-blue-700 focus:outline-none"
                    to={`/dashboard/${water.data.id}`}>
                    Szczegóły
                  </Link>
                </div>
              ))
            ) : (
              <p>Brak łowisk</p>
            )}
            <div className="buttons-div">
              <button
                onClick={previous}
                className={`bg-blue-500 focus:outline-none ${
                  hasPrevPage ? "" : "cursor-not-allowed opacity-50"
                }`}
                disabled={!hasPrevPage}>
                Poprzednia strona
              </button>
              <button
                onClick={paginate}
                className={`bg-blue-500 focus:outline-none ${
                  hasNextPage ? "" : "cursor-not-allowed opacity-50"
                }`}
                disabled={!hasNextPage}>
                Następna strona
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;

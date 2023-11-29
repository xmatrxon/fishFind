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
} from "firebase/firestore";
import { db } from "../config/firebase";

const Dashboard = () => {
  const [name, setName] = useState("");
  const [voivodeship, setVoivodeship] = useState("");
  const [fish, setFish] = useState("");
  const [waterData, setWaterData] = useState([]);
  const [allWaterData, setAllWaterData] = useState([]);

  const [lastDoc, setLastDoc] = useState(null);
  const [pageDow, setPageDown] = useState(0);
  const [pageBackk, setPageBackk] = useState(0);
  const [firstDoc, setFirstDoc] = useState(null);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const voivodeshipList = [
    { value: "dolnoslaskie", label: "Dolnośląskie" },
    { value: "kujawskoPomorskie", label: "Kujawsko-Pomorskie" },
    { value: "lubelskie", label: "Lubelskie" },
    { value: "lubuskie", label: "Lubuskie" },
    { value: "lodzkie", label: "Łódzkie" },
    { value: "malopolskie", label: "Małopolskie" },
    { value: "mazowieckie", label: "Mazowieckie" },
    { value: "opolskie", label: "Opolskie" },
    { value: "podkarpackie", label: "Podkarpackie" },
    { value: "podlaskie", label: "Podlaskie" },
    { value: "pomorskie", label: "Pomorskie" },
    { value: "slaskie", label: "Śląskie" },
    { value: "swietokrzyskie", label: "Świętokrzyskie" },
    { value: "warminskoMazurskie", label: "Warmińsko-Mazurskie" },
    { value: "wielkopolskie", label: "Wielkopolskie" },
    { value: "zachodniopomorskie", label: "Zachodniopomorskie" },
  ];

  const fishList = [
    { value: "amur", label: "Amur" },
    { value: "bolen", label: "Boleń" },
    { value: "jaz", label: "Jaź" },
    { value: "karas", label: "Karaś" },
    { value: "karp", label: "Karp" },
    { value: "kielb", label: "Kiełb" },
    { value: "klen", label: "Kleń" },
    { value: "krap", label: "Krąp" },
    { value: "leszcz", label: "Leszcz" },
    { value: "lin", label: "Lin" },
    { value: "lipien", label: "Lipień" },
    { value: "mietus", label: "Miętus" },
    { value: "okon", label: "Okoń" },
    { value: "pstragPotokowy", label: "Pstrąg potokowy" },
    { value: "pstragTeczowy", label: "Pstrąg tęczowy" },
    { value: "ploc", label: "Płoć" },
    { value: "sandacz", label: "Sandacz" },
    { value: "sum", label: "Sum" },
    { value: "szczupak", label: "Szczupak" },
    { value: "trocJeziorowa", label: "Troć jeziorowa" },
    { value: "ukleja", label: "Ukleja" },
    { value: "wzdrega", label: "Wzdręga" },
    { value: "wegorz", label: "Węgorz" },
    { value: "inne", label: "Inne" },
  ];

  const clickHandler = async (e) => {
    e.preventDefault();
    const q = query(collection(db, "markers"), where("name", "==", name));

    try {
      const querySnapshot = await getDocs(q);
      const waterData = [];
      querySnapshot.forEach((doc) => {
        waterData.push({ id: doc.id, data: doc.data() });
      });
      setWaterData(waterData);
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

      setHasNextPage(querySnapshot.docs.length === 5);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    allWaters();
  }, [pageDow]);

  const paginate = () => {
    setPageDown((prevPage) => prevPage + 1);
    setPageBackk(pageDow);
    setHasPrevPage(true);
  };

  const pageBack = async () => {
    setPageBackk((prevPage) => prevPage - 1);
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

      if (pageBackk >= 1) {
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
    <div className="flex h-screen w-screen items-center justify-center overflow-auto">
      <div className=" mt-20 h-full w-9/12 rounded-lg bg-white">
        <div>
          <form className="border-silver mb-10 flex w-full flex-wrap rounded border-b-2 border-solid bg-white pt-6">
            <div className="mb-6 ml-16 flex w-full">
              <input
                className="focus:shadow-outline mr-10 w-4/12 appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
                id="name"
                type="text"
                placeholder="Nazwa łowiska"
                name="name"
                onChange={(e) => setName(e.target.value)}
              />
              <Select
                className="mr-10 w-3/12"
                options={voivodeshipList}
                placeholder="Województwo"
                value={voivodeship}
                onChange={(e) => setVoivodeship(e.target.value)}
                isMulti={false}
              />
              <Select
                className="mr-10"
                options={fishList}
                placeholder="Występujące ryby"
                value={fish}
                onChange={(e) => setFish(e.target.value)}
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
          {allWaterData.map((water) => (
            <div
              key={water.data.id}
              className="mb-5 flex justify-between rounded-lg bg-red-500 px-10 py-3">
              <div>
                <p>{water.data.name}</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon icon-tabler icon-tabler-fish"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M16.69 7.44a6.973 6.973 0 0 0 -1.69 4.56c0 1.747 .64 3.345 1.699 4.571" />
                  <path d="M2 9.504c7.715 8.647 14.75 10.265 20 2.498c-5.25 -7.761 -12.285 -6.142 -20 2.504" />
                  <path d="M18 11v.01" />
                  <path d="M11.5 10.5c-.667 1 -.667 2 0 3" />
                </svg>
                {Array.isArray(water.data.fish) && (
                  <p>{water.data.fish.map((fish) => fish.label).join(", ")}</p>
                )}
              </div>
              <button className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none">
                Szczegóły
              </button>
            </div>
          ))}
          <div className="mt-4 flex justify-center">
            <button
              onClick={pageBack}
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
  );
};

export default Dashboard;

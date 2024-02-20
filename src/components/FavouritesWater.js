import { useEffect, useState } from "react";
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import FishIcon from "./FishIcon";

const FavouritesWater = ({ authUser }) => {
  const [allWater, setAllWater] = useState([]);
  const [loading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const fetchWaterData = async () => {
    try {
      const userQuerySnapshot = await getDocs(
        query(
          collection(db, "users"),
          where("UID", "==", authUser.reloadUserInfo.localId),
        ),
      );
      const usersData = userQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      const favouriteWaterIds =
        usersData[0]?.data?.favouriteWater.map((water) => water.id) || [];
      const waterData = [];

      for (let i = 0; i < favouriteWaterIds.length; i++) {
        const waterQuerySnapshot = await getDocs(
          query(
            collection(db, "markers"),
            where("id", "==", favouriteWaterIds[i]),
            orderBy("name"),
            limit(itemsPerPage),
          ),
        );
        waterQuerySnapshot.forEach((doc) => {
          waterData.push({ id: doc.id, data: doc.data() });
        });
      }
      setIsLoading(false);
      setAllWater(waterData);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchWaterData();
    }
  }, [authUser, currentPage]);

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWater = allWater.slice(indexOfFirstItem, indexOfLastItem);

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
    <div className="favouritesWater">
      <div className="header">
        <h1 className="header__heading ">Twoje ulubione łowiska</h1>
        <p className="header__text">
          Przeglądaj łowiska, które dodałeś do swoich ulubionych.
        </p>
        <div className="white-block white-block-left"></div>
      </div>
      <div className="content-div">
        <div className="inner-div">
          <div className="results-div">
            {currentWater.length > 0 ? (
              currentWater.map((water) => (
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
              <p className="noFavourites">Brak ulubionych łowisk</p>
            )}
            {currentWater.length > 0 ? (
              <div className="buttons-div">
                <button
                  className={`mx-1 rounded bg-blue-500 px-3 py-1 text-white focus:outline-none ${
                    currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}>
                  Poprzednia strona
                </button>
                <button
                  className={`mx-1 rounded bg-blue-500 px-3 py-1 text-white focus:outline-none ${
                    currentWater.length < itemsPerPage ||
                    allWater.length % itemsPerPage === 0
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                  onClick={handleNextPage}
                  disabled={
                    currentWater.length < itemsPerPage ||
                    allWater.length % itemsPerPage === 0
                  }>
                  Następna strona
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FavouritesWater;

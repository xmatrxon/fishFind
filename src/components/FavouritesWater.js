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

  return (
    <>
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#ddd] text-center">
        <p className="my-4 pt-4 text-[34px] font-bold">
          Twoje ulubione łowiska
        </p>
        <p className="text-[18px]">
          Przeglądaj łowiska, które dodałeś do swoich ulubionych.
        </p>
        <div className=" mt-20 h-3/4 w-9/12 rounded-lg bg-white">
          <div className="mt-6 px-10">
            {currentWater.length > 0 ? (
              currentWater.map((water) => (
                <div
                  key={water.data.id}
                  className="mb-5 flex h-full justify-between rounded-lg bg-[#ddd] px-10 py-3">
                  <div className="w-full">
                    <p>{water.data.name}</p>
                    <div className="flex w-full">
                      <FishIcon
                        height={24}
                        width={24}
                        iconColor={"currentColor"}
                      />
                      {Array.isArray(water.data.fish) && (
                        <p className="ml-2">
                          {water.data.fish.map((fish) => fish.label).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    className="focus:shadow-outline flex items-center justify-center rounded bg-blue-500 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none"
                    to={`/dashboard/${water.data.id}`}>
                    Szczegóły
                  </Link>
                </div>
              ))
            ) : (
              <p>Brak łowisk</p>
            )}
            <div>
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
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FavouritesWater;

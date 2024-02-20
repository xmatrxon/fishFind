import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import Control from "react-leaflet-custom-control";
import { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import MarkerClusterGroup from "react-leaflet-cluster";
import pointInPolygon from "point-in-polygon";
import { Link } from "react-router-dom";
import { useLoading } from "./LoadingContext";
import NewFormPopup from "./NewFormPopup";

import { db } from "../config/firebase";
import { collection, getDocs, query } from "firebase/firestore";

import ErrorModal from "./ErrorModal";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const Map = ({ authUser }) => {
  const [markersVisible, setMarkersVisible] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [markerLat, setMarkerLat] = useState();
  const [markerLng, setMarkerLng] = useState();
  const [clickedWaterId, setClickedWaterId] = useState("");
  const [voivodeships, setVoivodeships] = useState([]);
  const [userID, setUserID] = useState();
  const { isLoading, setLoading } = useLoading();
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const maxBounds = [
    [54.868323814195975, 13.503610861651275],
    [48.591069159320504, 24.93425207815491],
  ];

  useEffect(() => {
    setLoading(true);
  }, []);

  useEffect(() => {
    checkMatchingMarker();
  }, [markers, clickedWaterId, popupVisible]);

  useEffect(() => {
    const getMarkers = async () => {
      try {
        const q = query(collection(db, "markers"));
        const querySnapshot = await getDocs(q);
        const markersData = [];
        querySnapshot.forEach((doc) => {
          markersData.push({ id: doc.id, data: doc.data() });
        });
        setMarkers(markersData);
      } catch (err) {
        console.log(err);
      }
    };

    getMarkers();
  }, [popupVisible]);

  useEffect(() => {
    const fetchVoivodeships = async () => {
      try {
        const voivodeshipNames = [
          "slaskie",
          "dolnoslaskie",
          "kujawsko-pomorskie",
          "lodzkie",
          "lubelskie",
          "lubuskie",
          "malopolskie",
          "mazowieckie",
          "opolskie",
          "podkarpackie",
          "podlaskie",
          "pomorskie",
          "swietokrzyskie",
          "warminsko-mazurskie",
          "wielkopolskie",
          "zachodnio-pomorskie",
        ];

        const voivodeshipsData = await Promise.all(
          voivodeshipNames.map(async (voivodeship) => {
            const response = await fetch(
              `https://xmatrxon.github.io/apiSite/${voivodeship}.json`,
            );
            const data = await response.json();
            return { name: voivodeship, data };
          }),
        );

        setVoivodeships(voivodeshipsData);
      } catch (err) {
        console.log(err);
      }
    };

    const fetchData = async () => {
      if (!voivodeships.length) {
        await fetchVoivodeships();
      }

      if (voivodeships.length && markers.length) {
        setLoading(false);
      }
    };

    fetchData();
  }, [voivodeships, markers]);

  const closePopup = (data) => {
    setPopupVisible(data.value);
  };

  const AddMarker = () => {
    useMapEvents({
      click: async (e) => {
        if (authUser) {
          setUserID(authUser.uid);
          const clickedLatLng = e.latlng;
          setMarkerLat(clickedLatLng.lat);
          setMarkerLng(clickedLatLng.lng);

          const isInsideAnyVoivodeship = voivodeships.some((voivodeship) => {
            return voivodeship.data.features.some((feature) => {
              const coordinates = feature.geometry.coordinates[0];
              if (
                pointInPolygon(
                  [clickedLatLng.lng, clickedLatLng.lat],
                  coordinates,
                )
              ) {
                setClickedWaterId(feature.properties["@id"]);
                return true;
              }
              return false;
            });
          });

          if (isInsideAnyVoivodeship) {
            setPopupVisible(true);
          } else {
            setIsError(true);
            setErrorMsg(
              "Podane koordynaty nie znajdują się w żadnym zbiorniku wodnym.",
            );
          }
        } else {
          setIsError(true);
          setErrorMsg("Aby dodać łowisko należy się zalogować!");
        }
      },
    });
  };

  const checkMatchingMarker = async () => {
    const matchingMarker = markers.find(
      (marker) => marker.data.waterId === clickedWaterId,
    );

    if (matchingMarker && popupVisible) {
      setPopupVisible(false);
      setIsError(true);
      setErrorMsg("W tym zbiorniku wodnym znajduje się już łowisko.");
    }
  };

  const closeErrorModal = () => {
    setIsError(false);
  };

  if (isLoading) {
    return (
      <>
        <div className="flex h-[calc(100vh-48px)] items-center justify-center">
          <p className="pr-3">Wczytywanie mapy</p>
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
    <>
      <div className="map">
        <MapContainer
          center={[51.918904, 19.1343786]}
          maxBounds={maxBounds}
          zoom={7}
          minZoom={7}
          className="map-container w-screen">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AddMarker />
          <Control prepend position="topright">
            <div>
              <Tooltip id="my-tooltip" />
              <button
                aria-label="Change visible of markers"
                className="focus:shadow-outline mb-6 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                data-tooltip-id="my-tooltip"
                data-tooltip-content={
                  markersVisible ? "Ukryj łowiska" : "Pokaż łowiska"
                }
                onClick={() => setMarkersVisible(!markersVisible)}>
                {markersVisible ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-eye"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                    <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-eye-off"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
                    <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" />
                    <path d="M3 3l18 18" />
                  </svg>
                )}
              </button>
            </div>
          </Control>
          {markersVisible ? (
            <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
              {markers.map((water) => (
                <Marker
                  key={water.id}
                  position={[water.data.lat, water.data.lon]}>
                  <Popup>
                    <div className="popup">
                      <p>{water.data.name}</p>
                      <Link
                        className="focus:shadow-outline flex justify-center rounded bg-blue-500 px-4 py-2 font-bold !text-white hover:bg-blue-700 focus:outline-none"
                        to={`/dashboard/${water.data.id}`}>
                        Szczegóły
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          ) : null}
        </MapContainer>
      </div>

      <ErrorModal
        trigger={isError}
        setTrigger={setIsError}
        pass={closeErrorModal}
        errorMsg={errorMsg}
      />

      <NewFormPopup
        trigger={popupVisible}
        setTrigger={setPopupVisible}
        pass={closePopup}
        lat={markerLat}
        lng={markerLng}
        clickedWaterId={clickedWaterId}
        uid={userID}
      />
    </>
  );
};

export default Map;

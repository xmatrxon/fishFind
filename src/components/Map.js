import "../index.css";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  GeoJSON,
} from "react-leaflet";
import L from "leaflet";
import Control from "react-leaflet-custom-control";
import { Button } from "@mui/material";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import MarkerClusterGroup from "react-leaflet-cluster";
import FormPopup from "./FormPopup";
import pointInPolygon from "point-in-polygon";
import { Link } from "react-router-dom";

import { db } from "../config/firebase";
import { collection, getDocs, query } from "firebase/firestore";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});
const markersCollectionRef = collection(db, "markers");

const Map = () => {
  const [markersVisible, setMarkersVisible] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [markerLat, setMarkerLat] = useState();
  const [markerLng, setMarkerLng] = useState();
  const [clickedWaterId, setClickedWaterId] = useState(null);
  const [voivodeships, setVoivodeships] = useState([]);
  const [allWaterData, setAllWaterData] = useState([]);

  const maxBounds = [
    [54.868323814195975, 13.503610861651275],
    [48.591069159320504, 24.93425207815491],
  ];

  useEffect(() => {
    const getMarkers = async () => {
      const data = await getDocs(markersCollectionRef);
      setMarkers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    const getMM = async () => {
      const q = query(collection(db, "markers"));
      const querySnapshot = await getDocs(q);
      const waterData = [];
      querySnapshot.forEach((doc) => {
        waterData.push({ id: doc.id, data: doc.data() });
      });
      setAllWaterData(waterData);
    };

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

    getMM();
    getMarkers();
    fetchVoivodeships();
  }, [popupVisible]);

  useEffect(() => {
    checkMatchingMarker();
  }, [markers, clickedWaterId, popupVisible]);

  const onEachWater = (feature, layer) => {
    const waterName = feature.properties["@id"];
    layer.bindPopup(waterName);
  };

  const closePopup = (data) => {
    setPopupVisible(data.value);
  };

  const AddMarker = () => {
    useMapEvents({
      click: async (e) => {
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
          // console.log(`Id zbiornika: ${clickedWaterId}`);
        } else {
          alert("Podane koordynaty nie znajdują się w żadnym zbiorniku wodnym");
        }
      },
    });
  };

  const checkMatchingMarker = () => {
    const matchingMarker = markers.find(
      (marker) => marker.waterId === clickedWaterId,
    );

    if (matchingMarker && popupVisible) {
      setPopupVisible(false);
      alert(
        `W tej lokalizacji znajduje się już znacznik: ${matchingMarker.id}`,
      );
    }
  };

  console.log(allWaterData);

  return (
    <>
      <div className="absolute z-0">
        <MapContainer
          center={[51.918904, 19.1343786]}
          maxBounds={maxBounds}
          zoom={7}
          minZoom={7}
          className="h-screen w-screen">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AddMarker />
          <Control prepend position="topright">
            <div>
              <Tooltip id="my-tooltip" />
              <Button
                variant="contained"
                data-tooltip-id="my-tooltip"
                data-tooltip-content={
                  markersVisible ? "Ukryj łowiska" : "Pokaż łowiska"
                }
                onClick={() => setMarkersVisible(!markersVisible)}>
                <RemoveRedEyeIcon />
              </Button>
            </div>
          </Control>
          {/* <GeoJSON data={slaskie.features} onEachFeature={onEachWater} /> */}
          {markersVisible ? (
            <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
              {allWaterData.map((water) => (
                <Marker
                  key={water.id}
                  position={[water.data.lat, water.data.lon]}>
                  <Popup>
                    <div className="flex flex-col">
                      <p className="flex self-center">{water.data.name}</p>
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
      <FormPopup
        trigger={popupVisible}
        setTrigger={setPopupVisible}
        lat={markerLat}
        lng={markerLng}
        clickedWaterId={clickedWaterId}
        pass={closePopup}
      />
    </>
  );
};

export default Map;

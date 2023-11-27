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
import AddIcon from "@mui/icons-material/Add";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import MarkerClusterGroup from "react-leaflet-cluster";
import FormPopup from "./FormPopup";
import pointInPolygon from "point-in-polygon";

import { db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";

import slaskie from "../voivodeships/slaskie.json";
import dolnoslaskie from "../voivodeships/dolnoslaskie.json";
// import kujawskoPomorskie from "../voivodeships/kujawsko-pomorskie.json";
// import lodzkie from "../voivodeships/lodzkie.json";
// import lubelskie from "../voivodeships/lubelskie.json";
// import lubuskie from "../voivodeships/lubuskie.json";
// import malopolskie from "../voivodeships/malopolskie.json";
// import mazowieckie from "../voivodeships/mazowieckie.json";
// import opolskie from "../voivodeships/opolskie.json";
// import podkarpackie from "../voivodeships/podkarpackie.json";
// import podlaskie from "../voivodeships/podlaskie.json";
// import pomorskie from "../voivodeships/pomorskie.json";
// import swietokrzyskie from "../voivodeships/swietokrzyskie.json";
// import warminskoMazurskie from "../voivodeships/warminsko-mazurskie.json";
// import wielkopolskie from "../voivodeships/wielkopolskie.json";
// import zachodnioPomorskie from "../voivodeships/zachodnio-pomorskie.json";

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

  const maxBounds = [
    [54.868323814195975, 13.503610861651275],
    [48.591069159320504, 24.93425207815491],
  ];

  const voivodeships = [
    { name: "slaskie", data: slaskie },
    { name: "dolnoslaskie", data: dolnoslaskie },
    // { name: "kujawskoPomorskie", data: kujawskoPomorskie },
    // { name: "lodzkie", data: lodzkie },
    // { name: "lubelskie", data: lubelskie },
    // { name: "lubuskie", data: lubuskie },
    // { name: "malopolskie", data: malopolskie },
    // { name: "mazowieckie", data: mazowieckie },
    // { name: "opolskie", data: opolskie },
    // { name: "podkarpackie", data: podkarpackie },
    // { name: "podlaskie", data: podlaskie },
    // { name: "pomorskie", data: pomorskie },
    // { name: "swietokrzyskie", data: swietokrzyskie },
    // { name: "warminskoMazurskie", data: warminskoMazurskie },
    // { name: "wielkopolskie", data: wielkopolskie },
    // { name: "zachodnioPomorskie", data: zachodnioPomorskie },
  ];

  useEffect(() => {
    const getMarkers = async () => {
      const data = await getDocs(markersCollectionRef);
      setMarkers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getMarkers();
  }, [popupVisible]); //Dodac odswierzenie po dodaniu markera

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
                data-tooltip-content="Dodaj łowisko"
                onClick={() => setPopupVisible(true)}>
                <AddIcon />
              </Button>
              <Button
                variant="contained"
                data-tooltip-id="my-tooltip"
                data-tooltip-content={
                  markersVisible ? "Ukryj łowiska" : "Pokaż łowiska"
                }
                onClick={() => setMarkersVisible(!markersVisible)}>
                <RemoveRedEyeIcon />
              </Button>
              <Button
                variant="contained"
                data-tooltip-id="my-tooltip"
                data-tooltip-content="Powiększ mapę">
                <FullscreenIcon />
              </Button>
            </div>
          </Control>
          {/* <GeoJSON data={slaskie.features} onEachFeature={onEachWater} /> */}
          {markersVisible ? (
            <MarkerClusterGroup chunkedLoading showCoverageOnHover={false}>
              {markers.map((marker) => (
                <Marker key={marker.id} position={[marker.lat, marker.lon]}>
                  <Popup>
                    <Button>Szczegóły</Button>
                    {marker.name}
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

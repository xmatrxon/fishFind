import "../index.css";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import slaskie from "../voivodeships/slaskie.json";
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

import { db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";

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

  const maxBounds = [
    [54.868323814195975, 13.503610861651275],
    [48.591069159320504, 24.93425207815491],
  ];

  useEffect(() => {
    const getMarkers = async () => {
      const data = await getDocs(markersCollectionRef);
      setMarkers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getMarkers();
  }, []); //Dodac odswierzenie po dodaniu markera

  const AddMarker = () => {
    useMapEvents({
      click: (e) => {
        setMarkerLat(e.latlng.lat);
        setMarkerLng(e.latlng.lng);
        setPopupVisible(true);
      },
    });
  };

  const onEachWater = (slaskie, layer) => {
    const waterName = slaskie.properties.name;
    layer.bindPopup(waterName);
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
      />
    </>
  );
};

export default Map;

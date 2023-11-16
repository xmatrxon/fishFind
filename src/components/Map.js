import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  TileLayer,
  Polygon,
  GeoJSON,
  Marker,
} from 'react-leaflet';
import slaskie from '../voivodeships/slaskie.json';
import points from '../Points.json';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Map = () => {
  const onEachWater = (slaskie, layer) => {
    const waterName = slaskie.properties.name;
    layer.bindPopup(waterName);
  };

  return (
    <>
      <div>
        <button>Dodaj łowisko</button>
        <button>Pokaż łowiska</button>
        <button>Powiększ mapę</button>
      </div>
      <MapContainer
        style={{ height: '80vh' }}
        center={[51.918904, 19.1343786]}
        zoom={7}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <GeoJSON data={slaskie.features} onEachFeature={onEachWater} />
        {points.features.map((feature) => (
          <Marker
            key={feature.properties.id}
            position={[
              feature.geometry.coordinates[1],
              feature.geometry.coordinates[0],
            ]}
          />
        ))}
      </MapContainer>
    </>
  );
};

export default Map;

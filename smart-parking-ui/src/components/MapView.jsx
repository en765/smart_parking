import L from "leaflet";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapView({ parkings, defaultMapCenter, onSelectParking }) {
  return (
    <MapContainer center={defaultMapCenter} zoom={16} className="map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {parkings.map((parking) => (
        <Marker
          key={parking.id}
          position={parking.position}
          eventHandlers={{
            click: () => {
              onSelectParking(parking.id);
            },
          }}
        />
      ))}
    </MapContainer>
  );
}

export default MapView;
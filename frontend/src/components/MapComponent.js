import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon missing in production build
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = ({ listings }) => {
    // Default center (e.g., city center) - fallback if no listings
    const defaultCenter = [12.9716, 77.5946]; // Bangalore coordinates as example

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden glass-panel border border-white/20 shadow-xl relative z-0">
            <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {listings && listings.map((listing) => (
                    listing.lat && listing.lng && (
                        <Marker key={listing._id} position={[listing.lat, listing.lng]}>
                            <Popup className="glass-popup">
                                <div className="font-bold text-sm">{listing.title}</div>
                                <div className="text-xs text-muted-foreground">{listing.price} / month</div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;

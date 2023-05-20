import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const Map = () => {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [distance, setDistance] = useState(0);
  const mapContainerRef = useRef(null);
  const routingControlRef = useRef(null);
  const taxiMarkerRef = useRef(null);

  useEffect(() => {
    const initializeMap = () => {
      const map = L.map(mapContainerRef.current).setView([22.5626, 88.3630], 11);
      const mapLink = "<a href='http://openstreetmap.org'>OpenStreetMap</a>";
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { attribution: 'Leaflet &copy; ' + mapLink + ', contribution', maxZoom: 18 }).addTo(map);

      const taxiIcon = L.icon({
        iconUrl: 'https://cdn4.iconfinder.com/data/icons/transport-and-vehicles-filled-outline/64/ambulance-512.png',
        iconSize: [70, 70]
      });

      const geocoder = L.Control.Geocoder.nominatim();

      map.on('click', function (e) {
        const { lat, lng } = e.latlng;
        const newMarker = L.marker([lat, lng]).addTo(map);

        if (!pickup) {
          setPickup(`${lat}, ${lng}`);
        } else if (!dropoff) {
          setDropoff(`${lat}, ${lng}`);
          calculateRoute(pickup, `${lat}, ${lng}`);
        }
      });

      const calculateRoute = (pickup, dropoff) => {
        if (routingControlRef.current) {
          map.removeControl(routingControlRef.current);
        }

        geocoder.geocode(pickup, (results) => {
          const pickupLatLng = results[0].center;

          geocoder.geocode(dropoff, (results) => {
            const dropoffLatLng = results[0].center;

            routingControlRef.current = L.Routing.control({
              waypoints: [
                L.latLng(pickupLatLng.lat, pickupLatLng.lng),
                L.latLng(dropoffLatLng.lat, dropoffLatLng.lng)
              ]
            }).on('routesfound', function (e) {
              const routes = e.routes;
              const distance = routes[0].summary.totalDistance / 1000; // Convert distance to kilometers
              setDistance(distance.toFixed(2)); // Set distance with 2 decimal places

              taxiMarkerRef.current = L.marker(pickupLatLng, { icon: taxiIcon }).addTo(map);

              e.routes[0].coordinates.forEach(function (coord, index) {
                setTimeout(function () {
                  taxiMarkerRef.current.setLatLng([coord.lat, coord.lng]);
                }, 100 * index);
              });
            }).addTo(map);
          });
        });
      };

      setPickup('');
      setDropoff('');
      setDistance(0);
    };

    initializeMap();
  }, []);

  return (
    <div>
      <div ref={mapContainerRef} style={{ width: '100%', height: '90vh' }}></div>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <strong>Pickup:</strong> {pickup}
      </div>
      <div style={{ textAlign: 'center' }}>
        <strong>Dropoff:</strong> {dropoff}
      </div>
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <strong>Distance:</strong> {distance} km
      </div>
    </div>
  );
};

export default Map;
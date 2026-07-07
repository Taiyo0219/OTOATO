import { useEffect, useMemo } from "react";
import L from "leaflet";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";

const DEFAULT_CENTER = [35.681236, 139.767125];

const currentLocationIcon = L.divIcon({
  className: "otoato-current-marker",
  html: "<span></span>",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

const postMarkerIcon = L.divIcon({
  className: "otoato-post-marker",
  html: "<span></span>",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17]
});

const selectedPostMarkerIcon = L.divIcon({
  className: "otoato-post-marker is-selected",
  html: "<span></span>",
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -19]
});

const selectedLocationIcon = L.divIcon({
  className: "otoato-selected-location-marker",
  html: "<span></span>",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -32]
});

function MapViewUpdater({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.7 });
    const timer = window.setTimeout(() => map.invalidateSize(), 100);

    return () => window.clearTimeout(timer);
  }, [center, map, zoom]);

  return null;
}

function MapClickHandler({ enabled, onSelectLocation }) {
  useMapEvents({
    click(event) {
      if (!enabled) {
        return;
      }

      onSelectLocation?.({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
        source: "manual"
      });
    }
  });

  return null;
}

function LeafletMap({
  posts = [],
  selectedPostId,
  currentLocation,
  selectedLocation,
  onSelectPost,
  onSelectLocation,
  compact = false
}) {
  const center = useMemo(() => {
    if (selectedLocation) {
      return [selectedLocation.latitude, selectedLocation.longitude];
    }

    if (currentLocation) {
      return [currentLocation.latitude, currentLocation.longitude];
    }

    return DEFAULT_CENTER;
  }, [currentLocation, selectedLocation]);

  const zoom = currentLocation || selectedLocation ? 16 : 15;
  const currentPosition = currentLocation ? [currentLocation.latitude, currentLocation.longitude] : null;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`leaflet-map${compact ? " is-compact" : ""}`}
      scrollWheelZoom={false}
      zoomControl={false}
      tap
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewUpdater center={center} zoom={zoom} />
      <MapClickHandler enabled={Boolean(onSelectLocation)} onSelectLocation={onSelectLocation} />

      {currentPosition ? (
        <>
          <Circle
            center={currentPosition}
            radius={Math.min(currentLocation.accuracy || 35, 400)}
            pathOptions={{ color: "#2ad4ff", fillColor: "#2ad4ff", fillOpacity: 0.12, weight: 1 }}
          />
          <Marker position={currentPosition} icon={currentLocationIcon}>
            <Popup>現在地</Popup>
          </Marker>
        </>
      ) : null}

      {selectedLocation ? (
        <Marker position={[selectedLocation.latitude, selectedLocation.longitude]} icon={selectedLocationIcon}>
          <Popup>投稿地点</Popup>
        </Marker>
      ) : null}

      {posts.map((post) => {
        if (!post.location) {
          return null;
        }

        const position = [post.location.latitude, post.location.longitude];
        const isSelected = selectedPostId === post.id;

        return (
          <Marker
            key={post.id}
            position={position}
            icon={isSelected ? selectedPostMarkerIcon : postMarkerIcon}
            eventHandlers={{
              click: () => onSelectPost?.(post)
            }}
          >
            <Popup>
              <strong>{post.track.title}</strong>
              <br />
              {post.track.artist}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default LeafletMap;

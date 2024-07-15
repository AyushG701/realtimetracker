const socket = io();

console.log("hey");
// Prompt user for name
const userName = prompt("Please enter your name:");
if (!userName) {
  alert("Name is required!");
  throw new Error("Name not provided.");
}

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      console.log(position);
      const { latitude, longitude } = position.coords;

      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.log(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    },
  );
}

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap",
}).addTo(map);

const markers = {};

// Use user's name as a marker label
const markerLabel = userName;

socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  map.setView([latitude, longitude]);
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
    markers[id].bindPopup(markerLabel).openPopup();
  } else {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
    markers[id].bindPopup(markerLabel).openPopup();
  }
  console.log(data);
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});

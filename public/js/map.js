
// map initialize
var map = L.map('map').setView(coordinates, 13);

// standard roadmap layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

// marker example
var marker = L.marker(coordinates).addTo(map);
marker.bindPopup("Where you wi'll be").openPopup();


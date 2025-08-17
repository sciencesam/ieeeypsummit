document.addEventListener("DOMContentLoaded", function () {
const map = L.map('map', {
    zoomSnap: 0.1,
    scrollWheelZoom: false,
  });

  const bounds = [];

  const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> & contributors',
  }).addTo(map);



  // Hotels grouped by area
  const hotelGroups = [
    {
      name: 'Brooklyn Hotels',
      coords: [
        [40.69269211188672, -73.98205472122571],
        [40.6927, -73.9875]
      ],
      links: [
        ['Hampton Inn Brooklyn Downtown', 'https://maps.app.goo.gl/8EV3VPNf94dKYSti7'],
        ['Hilton Brooklyn New York', 'https://maps.app.goo.gl/cWxPAkp1m4JxVePr8'],
        ['Aloft New York Brooklyn', 'https://maps.app.goo.gl/gtfU53PeLBPc195L8'],
      ]
    },
    {
      name: 'Jersey City Hotels',
      coords: [
        [40.71840734973723, -74.03417215632061],
        [40.7145, -74.0341]
      ],
      links: [
        ['Hyatt Regency Jersey City', 'https://maps.app.goo.gl/h7DSgGCszqrdHmpX8'],
        ['Sonesta Simply Suites Jersey City', 'https://maps.app.goo.gl/F4GeoB9JhMGe4EJe7'],
      ]
    },
    {
      name: 'Queens (LIC) Hotels',
      coords: [
        [40.75242594614098, -73.93680098898402],
        [40.7473, -73.9429]
      ],
      links: [
        ['Hyatt Place Long Island City', 'https://maps.app.goo.gl/i7gbRiKejDGfgj289'],
        ['Wingate by Wyndham Long Island City', 'https://maps.app.goo.gl/jDGuB2YUVVYWp44k8'],
        ['Aloft Long Island City','https://maps.app.goo.gl/wXhJ1GpmaQdeWTJQ6'],
      ]
    }
  ];



  function midpoint(latlngs) {
    const [firstLat, firstLng] = latlngs[0];
    const [lastLat, lastLng] = latlngs[latlngs.length - 1];
    const midlat = (lastLat + firstLat)/2;
    const midlong = (lastLng + firstLng)/2;
    const midpoint = [midlat, midlong];
    return midpoint;
  //   const idx = Math.floor(latlngs.length / 2);
  //   return latlngs[idx];
  }

  function addRoute(latlngs, color, label,icon) {
    L.polyline(latlngs, { color, weight: 4 }).addTo(map);
    bounds.push(...latlngs);

    const center = midpoint(latlngs);

  //   const icon = L.divIcon({
  //     html: `<div class="icon-label" style="background:${color}; border-radius:50%; width:28px; height:28px;">${label}</div>`,
  //     className: ''
  //   });
    if (arguments.length === 4) {
      L.marker(center, { icon }).addTo(map);
    }
  }

  // Brooklyn 2/3
  const icon23 = L.icon({
      iconUrl: 'icons/train_23.png',
      iconSize: [56, 28],       // width x height in pixels
      iconAnchor: [56, 0],     // center bottom (half width, half height)
  });

  addRoute([
    [40.6905, -73.9850],  // Hoyt
    [40.6924, -73.9903],  // Borough Hall
    [40.6970, -73.9930],  // Clark
    [40.7072, -74.0092],  // Wall St
  ], 'red', '2',icon23);

  addRoute([
    [40.7072, -74.0092],  // Wall St
    [40.755417658520365, -73.98743503883057]   // Venue (42 Times Sq)
  ], 'red', '2');

  // Jersey City PATH
  const iconPATH = L.icon({
      iconUrl: 'icons/path_train.png',
      iconSize: [56, 28],       // width x height in pixels
      iconAnchor: [40, 0],     // center bottom (half width, half height)
  });

  addRoute([
    [40.7160, -74.0321],  // Exchange Place
    [40.71159046346357, -74.01326946574508],  // WTC
  ], 'blue', 'PATH',iconPATH);

  // Jersey City 1
  const icon1 = L.icon({
    iconUrl: 'icons/train_1.png',
    iconSize: [56, 28],       // width x height in pixels
    iconAnchor: [56, 14],     // center bottom (half width, half height)
  });
  addRoute([
    [40.71159046346357, -74.01326946574508],  // WTC
    [40.755417658520365, -73.98743503883057]   // Venue (42 Times Sq)
  ], 'red', '1',icon1);

  // LIC: R route
  const iconR = L.icon({
      iconUrl: 'icons/train_R.png',
      iconSize: [56, 28],       // width x height in pixels
      iconAnchor: [28, 14],     // center bottom (half width, half height)
  });
  

  addRoute([
    [40.7483, -73.9373],  // Queens Plaza
    [40.76271759698326, -73.96780088677686],   // Lex Av (R)
  ], 'orange', 'R', iconR);

  addRoute([
    [40.76271759698326, -73.96780088677686],   // Lex Av (R)
    [40.755417658520365, -73.98743503883057] // Venue (42 Times Sq)
  ], 'orange', 'R');


  // Venue with IEEE logo
  const ieeeIcon = L.icon({
    iconUrl: 'icons/ieee_logo_icon.png',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
  const venue = [40.75121917550264, -73.98414697321572];
  L.marker(venue, { icon: ieeeIcon })
  .addTo(map)
  .bindPopup('YP Summit Venue: Jay Conference Empire')
  .bindTooltip("YP Summit venue", {
    permanent: true,
    direction: "right",
    offset: [15, 0],
    className: "hotel-tooltip"
  });
  bounds.push(venue);

  // Hotel icon
  const hotelIcon = L.icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/buildings.svg',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  hotelGroups.forEach(group => {
    const popupHtml = group.links.map(
      ([name, url]) => `<div><a href="${url}" target="_blank">${name}</a></div>`
    ).join('');
    const marker = L.marker(group.coords[0], { icon: hotelIcon })
      .addTo(map)
      .bindPopup(`<strong>${group.name}</strong><br>${popupHtml}`)
      .bindTooltip(group.name.replace(" Hotels", ""), {
        permanent: true,
        direction: "right",
        offset: [15, -10],
        className: "hotel-tooltip"
      });
    bounds.push(...group.coords);
  });

map.fitBounds(bounds, { padding: [40, 40] });

const containerMap = {
    "Jersey City Hotels": document.getElementById("JC-list"),
    "Queens (LIC) Hotels": document.getElementById("LIC-list"),
    "Brooklyn Hotels": document.getElementById("Brooklyn-list")
    };

hotelGroups.forEach(group => {
    const container = containerMap[group.name];
    if (!container) return; // Skip if container not found

    // const groupHeader = document.createElement("h4");
    // groupHeader.textContent = "Hotels";
    // container.appendChild(groupHeader);

    const ul = document.createElement("ul");
    group.links.forEach(([hotelName, hotelUrl]) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = hotelUrl;
        a.textContent = hotelName;
        a.target = "_blank";
        li.appendChild(a);
        ul.appendChild(li);
    });

    container.appendChild(ul);
});
});
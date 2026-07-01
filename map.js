document.addEventListener("DOMContentLoaded", function () {
  const mapElement = document.getElementById("map");
  if (!mapElement || typeof L === "undefined") return;

  const map = L.map("map", {
    zoomSnap: 0.1,
    scrollWheelZoom: false,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const locations = [
    {
      name: "Summit Venue",
      detail: "Boston University Photonics Building (PHO), 8 St Mary's St, Boston, MA 02215",
      coords: [42.34927542965443, -71.10589025543275],
      link: "https://maps.app.goo.gl/qzZd25q8Ro3h3nj99",
      linkText: "Open in Google Maps",
      color: "#004f9f",
    },
    {
      name: "BU On-Campus Housing",
      detail: "On-campus housing at 10 Buick Street, Boston, MA 02215.",
      coords: [42.352436984966566, -71.11597251321153],
      link: "https://bu.irisregistration.com/Site/IEEE2026",
      linkText: "Book BU housing",
      mapsLink: "https://www.google.com/maps/search/?api=1&query=10%20Buick%20Street%2C%20Boston%2C%20MA%2002215",
      markerType: "hotel",
      color: "#1ca64d",
    },
    {
      name: "DoubleTree Suites Boston - Cambridge",
      detail: "VIP hotel block at 400 Soldiers Field Road, Boston, MA 02134.",
      coords: [42.36047436363813, -71.11804785581758],
      link: "https://www.hilton.com/en/attend-my-event/bossbdt-91a-84d68467-d2d4-4895-bc73-aee11d0fedf7/",
      linkText: "Book Hilton DoubleTree Cambridge",
      mapsLink: "https://www.google.com/maps/dir/Boston+University+Photonics+Building+(PHO),+8+St+Mary's+St,+Boston,+MA+02215/400+Soldiers+Fld+Rd,+Boston,+MA+02134/@42.3550611,-71.1326077,2930m/data=!3m1!1e3!4m18!4m17!1m5!1m1!1s0x89e379f188bfd413:0xc16928482cd3c4e1!2m2!1d-71.1066353!2d42.3492536!1m5!1m1!1s0x89e379e0fc240fa5:0x5cec71db96fdbad3!2m2!1d-71.11832!2d42.360259!2m3!6e0!7e2!8j1782637200!3e3!5m1!1e2?entry=ttu&g_ep=EgoyMDI2MDYyNC4wIKXMDSoASAFQAw%3D%3D",
      mapsLinkText: "Transit directions in Google Maps",
      markerType: "hotel",
      color: "#7a4ea3",
    },
  ];

  const bounds = [];
  const summitVenue = locations.find((location) => location.name === "Summit Venue");
  const buHousing = locations.find((location) => location.name === "BU On-Campus Housing");

  if (summitVenue && buHousing) {
    const buHousingRoute = [
      [42.35089799616848, -71.11432221275149],
      [42.35001027541202, -71.10690423630051],
    ];

    L.polyline(buHousingRoute, {
      color: "#1ca64d",
      weight: 4,
      opacity: 0.75,
    })
      .addTo(map)
      .bindTooltip("MBTA Green Line B branch", {
        direction: "center",
        sticky: true,
      });

    bounds.push(...buHousingRoute);
  }

  L.marker([42.35045, -71.11055], {
    icon: L.divIcon({
      className: "green-line-label",
      html: "<span>B</span>",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    }),
    interactive: false,
  }).addTo(map);

  bounds.push([42.35045, -71.11055]);

  const hiltonTransitRoute = [
    [42.360674230575796, -71.11872456882071],
    [42.35341200925233, -71.13790772767311],
    [42.35022461273822, -71.10709450994374],
  ];

  L.polyline(hiltonTransitRoute, {
    color: "#f2c94c",
    weight: 5,
    opacity: 0.9,
  })
    .addTo(map)
    .bindTooltip("Transit route to DoubleTree via MBTA 57/64", {
      direction: "center",
      sticky: true,
    });

  bounds.push(...hiltonTransitRoute);

  [
    { label: "64", coords: [42.3569, -71.1288] },
    { label: "57", coords: [42.3518, -71.1226] },
  ].forEach((route) => {
    L.marker(route.coords, {
      icon: L.divIcon({
        className: "bus-route-label",
        html: `<span>${route.label}</span>`,
        iconSize: [28, 20],
        iconAnchor: [14, 10],
      }),
      interactive: false,
    }).addTo(map);

    bounds.push(route.coords);
  });

  const venueIcon = L.icon({
    iconUrl: "icons/ieee_logo_icon.png",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  const hotelIcon = L.icon({
    iconUrl: "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/icons/buildings.svg",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  function makeMarkerIcon(color) {
    return L.divIcon({
      className: "summit-map-marker",
      html: `<span style="background:${color}"></span>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }

  locations.forEach((location) => {
    const mapsLink = location.mapsLink
      ? `<br><a href="${location.mapsLink}" target="_blank" rel="noopener">${location.mapsLinkText || "Open in Google Maps"}</a>`
      : "";
    const popup = `
      <strong>${location.name}</strong><br>
      ${location.detail}<br>
      <a href="${location.link}" target="_blank" rel="noopener">${location.linkText}</a>
      ${mapsLink}
    `;

    const isStayMarker = location.markerType === "hotel";
    const icon = location.name === "Summit Venue"
      ? venueIcon
      : isStayMarker
        ? hotelIcon
        : makeMarkerIcon(location.color);

    L.marker(location.coords, { icon })
      .addTo(map)
      .bindPopup(popup)
      .bindTooltip(location.name, {
        permanent: isStayMarker,
        direction: isStayMarker ? "right" : "top",
        offset: isStayMarker ? [15, -10] : [0, -8],
        className: "hotel-tooltip",
      });

    bounds.push(location.coords);
  });

  map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
});

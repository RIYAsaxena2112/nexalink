import { Loader } from "@googlemaps/js-api-loader";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useRef } from "react";
import { db } from "../services/firebase";
import { Link } from "react-router-dom";
import { logOut } from "../services/auth";

export default function MapView() {

  // ✅ persist instances without re-render
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const circlesRef = useRef([])
  
  // --------------------------------------------------
  // Marker Color Logic
  // --------------------------------------------------
  const getMarkerColor = (urgency) => {
    if (!urgency) return "grey";
    if (urgency >= 8) return "red";
    if (urgency >= 5) return "orange";
    return "green";
  };

  useEffect(() => {
    let unsubscribe;

    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["marker"]          
    });

    const initMap = async () => {

      const google = await loader.load();

      // ✅ Create map once
      if (!mapRef.current) {
        mapRef.current = new google.maps.Map(
          document.getElementById("map"),
          {
            center: { lat: 21.1458, lng: 79.0882 },
            zoom: 5,
          }
        );
      }

      const map = mapRef.current;

      // --------------------------------------------------
      // Firestore Realtime Listener
      // --------------------------------------------------
      unsubscribe = onSnapshot(
        collection(db, "needs"),
        (snapshot) => {

          // ==============================
          // MARKERS
          // ==============================
          snapshot.docChanges().forEach((change) => {

            const need = change.doc.data();
            const id = change.doc.id;

            if (!need.coordinates) return;

            if (change.type === "added") {

              const marker = new google.maps.Marker({
                position: {
                  lat: need.coordinates.lat,
                  lng: need.coordinates.lng,
                },
                map,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: getMarkerColor(need.urgency),
                  fillOpacity: 1,
                  strokeColor: "white",
                  strokeWeight: 2,
                },
                title: need.summary,
              });

              markersRef.current[id] = marker;
            }

            if (change.type === "removed") {
              markersRef.current[id]?.setMap(null);
              delete markersRef.current[id];
            }
          });
          
// URGENCY CIRCLES
// ==============================
// Clear old circles
circlesRef.current.forEach(circle => circle.setMap(null))
circlesRef.current = []
snapshot.docs.forEach((docSnap) => {

  const data = docSnap.data();

  if (!data.coordinates) return;

  const position = {
    lat: data.coordinates.lat,
    lng: data.coordinates.lng,
  };

  const urgency = data.urgency || 1;

  let color = "#22c55e"; // green
  let radius = 20000;

  if (urgency >= 8) {
    color = "#ef4444"; // red
    radius = 60000;
  } else if (urgency >= 5) {
    color = "#f97316"; // orange
    radius = 40000;
  }

  const circle = new google.maps.Circle({
  strokeColor: color,
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: color,
  fillOpacity: 0.2,
  map,
  center: position,
  radius,
})
circlesRef.current.push(circle)
})
        }
      )
    };


    initMap();

    return () => {
      unsubscribe && unsubscribe();
    };
  }, []);

return (
  <div className="relative w-full h-screen">
    
    {/* Floating Navbar */}
    <nav
      style={{ backgroundColor: 'rgba(26, 29, 39, 0.95)' }}
      className="absolute top-0 left-0 right-0 z-10 px-6 py-4 flex items-center justify-between border-b border-gray-800"
    >
      <span className="text-teal-500 font-bold text-xl">NexaLink</span>
      
      <div className="flex gap-3 items-center">
        <span className="text-gray-400 text-sm hidden md:block">Live Crisis Map</span>
        <Link to="/dashboard" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition text-sm">
          Dashboard
        </Link>
        <button
          onClick={logOut}
          className="border border-gray-600 px-4 py-2 rounded hover:bg-gray-700 transition text-sm text-white"
        >
          Sign Out
        </button>
      </div>
    </nav>

    {/* Map fills full screen behind navbar */}
    <div id="map" className="w-full h-full" />
  </div>
);
}
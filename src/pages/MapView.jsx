import { Loader } from "@googlemaps/js-api-loader";
import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useRef } from "react";
import { db } from "../services/firebase";

export default function MapView() {

  // ✅ persist instances without re-render
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const heatmapRef = useRef(null);

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
      libraries: ["marker", "visualization"], // ✅ heatmap library added
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

          // ==============================
          // HEATMAP DATA
          // ==============================
          const heatmapData = snapshot.docs
            .filter((d) => d.data().coordinates)
            .map((d) => ({
              location: new google.maps.LatLng(
                d.data().coordinates.lat,
                d.data().coordinates.lng
              ),
              weight: d.data().urgency || 1,
            }));

          // remove old heatmap
          if (heatmapRef.current) {
            heatmapRef.current.setMap(null);
          }

          // create new heatmap
          heatmapRef.current =
            new google.maps.visualization.HeatmapLayer({
              data: heatmapData,
              map,
              radius: 50,
            });
        }
      );
    };

    initMap();

    return () => {
      unsubscribe && unsubscribe();
    };
  }, []);

  return (
    <div
      id="map"
      className="w-full h-screen"
    />
  );
}
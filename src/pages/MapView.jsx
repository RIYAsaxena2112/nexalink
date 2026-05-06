
import { Loader } from "@googlemaps/js-api-loader"
import { collection, onSnapshot } from "firebase/firestore"
import { useEffect, useRef } from "react"
import { db } from "../services/firebase"
import { logOut } from "../services/auth"

// ✅ create loader OUTSIDE component
const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  version: "weekly",
  libraries: ["marker"]
})

export default function MapView() {

  // DOM container
  const mapContainerRef = useRef(null)

  // Google map instance
  const mapRef = useRef(null)

  // Marker registry
  const markersRef = useRef({})

  // urgency color helper
  const getMarkerColor = (urgency) => {
    if (!urgency) return "grey"
    if (urgency >= 8) return "red"
    if (urgency >= 5) return "orange"
    return "green"
  }

  useEffect(() => {

    let unsubscribe

    const initMap = async () => {

      if (!mapContainerRef.current) return

      const google = await loader.load()

      // ✅ create map ONLY once
      if (!mapRef.current) {
        mapRef.current = new google.maps.Map(
          mapContainerRef.current,
          {
            center: { lat: 21.1458, lng: 79.0882 },
            zoom: 5
          }
        )
      }

      const map = mapRef.current

      // ===============================
      // 🔥 FIRESTORE REALTIME LISTENER
      // ===============================
      unsubscribe = onSnapshot(
        collection(db, "needs"),
        (snapshot) => {

          snapshot.docChanges().forEach((change) => {

            const id = change.doc.id
            const need = change.doc.data()

            // ✅ defensive safety checks
            if (
              !need.coordinates ||
              need.coordinates.lat == null ||
              need.coordinates.lng == null
            ) {
              return
            }

            const position = {
              lat: Number(need.coordinates.lat),
              lng: Number(need.coordinates.lng)
            }

            // ===================
            // ADDED
            // ===================
            if (change.type === "added") {

              const marker = new google.maps.Marker({
                position,
                map,
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: getMarkerColor(need.urgency),
                  fillOpacity: 1,
                  strokeColor: "white",
                  strokeWeight: 2
                },
                title: need.summary || "Need"
              })

              markersRef.current[id] = marker
            }

            // ===================
            // MODIFIED
            // ===================
            if (change.type === "modified") {

              const marker = markersRef.current[id]
              if (!marker) return

              marker.setPosition(position)

              marker.setIcon({
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: getMarkerColor(need.urgency),
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2
              })
            }

            // ===================
            // REMOVED
            // ===================
            if (change.type === "removed") {

              const marker = markersRef.current[id]

              if (marker) {
                marker.setMap(null)
                delete markersRef.current[id]
              }
            }

          })
        }
      )
    }

    initMap()

    // cleanup listener
    return () => {
      if (unsubscribe) unsubscribe()
    }

  }, [])

  // ✅ IMPORTANT: give container height
  return (
    <div
      ref={mapContainerRef}
      style={{ width: "100%", height: "100vh" }}
    >
      <button onClick={logOut}>Sign Out</button>
    </div>
    
  )
}


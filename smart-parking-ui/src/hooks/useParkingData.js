import { useEffect, useRef, useState } from "react";

import { getInitialParkings } from "../services/parkingService";
import { connectToParkingWebSocket } from "../services/websocketService";
import { applySpotUpdateToParkings } from "../utils/parkingUpdates";

const RECONNECT_DELAY_MS = 3000;

export function useParkingData() {
  const [parkings, setParkings] = useState([]);
  const [selectedParkingId, setSelectedParkingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [websocketStatus, setWebsocketStatus] = useState("Nije povezan");

  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const destroyedRef = useRef(false);

  useEffect(() => {
    async function loadInitialParkings() {
      try {
        const data = await getInitialParkings();
        setParkings(data);
      } catch (error) {
        setErrorMessage("Nije moguće dohvatiti podatke o parkingu.");
      } finally {
        setLoading(false);
      }
    }

    loadInitialParkings();
  }, []);

  function applySpotUpdate(message) {
    setParkings((currentParkings) =>
      applySpotUpdateToParkings(currentParkings, message)
    );
  }

  useEffect(() => {
    destroyedRef.current = false;

    function connect() {
      if (destroyedRef.current) return;

      const socket = connectToParkingWebSocket({
        onOpen: () => {
          setWebsocketStatus("Povezan");
          console.log("WebSocket povezan");
        },

        onMessage: (message) => {
          if (message.type === "spot_update") {
            applySpotUpdate(message);
          }
        },

        onError: () => {
          setWebsocketStatus("Greška");
          console.log("WebSocket greška");
        },

        onClose: () => {
          setWebsocketStatus("Nije povezan");
          console.log("WebSocket veza zatvorena");
          if (!destroyedRef.current) {
            reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
          }
        },
      });

      socketRef.current = socket;
    }

    connect();

    return () => {
      destroyedRef.current = true;
      clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
    };
  }, []);

  const selectedParking = parkings.find(
    (parking) => parking.id === selectedParkingId
  );

  const totalSpots = selectedParking?.spots.length ?? 0;

  const occupiedSpots =
    selectedParking?.spots.filter((spot) => spot.online && spot.occupied)
      .length ?? 0;

  const freeSpots =
    selectedParking?.spots.filter((spot) => spot.online && !spot.occupied)
      .length ?? 0;

  const occupancyPercentage =
    totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 100) : 0;

  return {
    parkings,
    selectedParking,
    setSelectedParkingId,
    loading,
    errorMessage,
    websocketStatus,
    totalSpots,
    freeSpots,
    occupiedSpots,
    occupancyPercentage,
  };
}
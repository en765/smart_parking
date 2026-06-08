export function formatUpdateTime(timestamp) {
  if (!timestamp) {
    return new Date().toLocaleTimeString("hr-HR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return new Date(timestamp).toLocaleTimeString("hr-HR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function applySpotUpdateToParkings(currentParkings, message) {
  return currentParkings.map((parking) => {
    if (parking.id !== message.parkingId) {
      return parking;
    }

    return {
      ...parking,
      lastUpdated: formatUpdateTime(message.timestamp),
      spots: parking.spots.map((spot) => {
        if (spot.id !== message.spotId) {
          return spot;
        }

        return {
          ...spot,
          occupied: message.occupied,
          online: message.online ?? spot.online,
          source: message.source ?? spot.source,
        };
      }),
    };
  });
}
function ParkingSpotGrid({ spots }) {
  return (
    <div className="spots-section">
      <h3>Parking mjesta</h3>

      <div className="spots-grid">
        {spots.map((spot) => {
          let statusClass = "spot-free";
          let statusText = "Slobodno";

          if (!spot.online) {
            statusClass = "spot-offline";
            statusText = "Offline";
          } else if (spot.occupied) {
            statusClass = "spot-occupied";
            statusText = "Zauzeto";
          }

          return (
            <div key={spot.id} className={`parking-spot ${statusClass}`}>
              <strong>{spot.id}</strong>
              <span>{statusText}</span>
              <small>
                {spot.source === "sensor" ? "Senzor" : "Simulacija"}
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ParkingSpotGrid;
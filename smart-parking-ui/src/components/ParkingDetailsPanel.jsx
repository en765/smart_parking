import SummaryCards from "./SummaryCards";
import ParkingSpotGrid from "./ParkingSpotGrid";

function ParkingDetailsPanel({
  selectedParking,
  totalSpots,
  freeSpots,
  occupiedSpots,
  occupancyPercentage,
}) {
  if (!selectedParking) {
    return (
      <aside className="details-panel">
        <div className="empty-panel">
          <h2>Odaberi parking</h2>
          <p>Klikni na marker na karti za prikaz detalja.</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="details-panel">
      <h2>{selectedParking.name}</h2>
      <p className="muted">
        Zadnje ažuriranje: {selectedParking.lastUpdated}
      </p>

      <SummaryCards
        totalSpots={totalSpots}
        freeSpots={freeSpots}
        occupiedSpots={occupiedSpots}
        occupancyPercentage={occupancyPercentage}
      />

      <ParkingSpotGrid spots={selectedParking.spots} />
    </aside>
  );
}

export default ParkingDetailsPanel;
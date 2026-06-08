function SummaryCards({ totalSpots, freeSpots, occupiedSpots, occupancyPercentage }) {
  return (
    <div className="summary-grid">
      <div className="summary-card">
        <span>Ukupno mjesta</span>
        <strong>{totalSpots}</strong>
      </div>

      <div className="summary-card">
        <span>Slobodno</span>
        <strong>{freeSpots}</strong>
      </div>

      <div className="summary-card">
        <span>Zauzeto</span>
        <strong>{occupiedSpots}</strong>
      </div>

      <div className="summary-card">
        <span>Popunjenost</span>
        <strong>{occupancyPercentage}%</strong>
      </div>
    </div>
  );
}

export default SummaryCards;
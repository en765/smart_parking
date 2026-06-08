import MapView from "./components/MapView";
import ParkingDetailsPanel from "./components/ParkingDetailsPanel";
import { useParkingData } from "./hooks/useParkingData";

function App() {
  const {
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
  } = useParkingData();

  const defaultMapCenter = [45.8008, 15.9714];

  return (
    <div className="app">
      <header className="header">
        <h1>SmartParking</h1>
        <p>Pregled dostupnosti parking mjesta u stvarnom vremenu</p>
        <p className="connection-status">WebSocket: {websocketStatus}</p>
      </header>

      <main className="main-content dashboard-layout">
        <section className="map-section">
          {loading ? (
            <p>Učitavanje karte i parking podataka...</p>
          ) : errorMessage ? (
            <p>{errorMessage}</p>
          ) : (
            <MapView
              parkings={parkings}
              defaultMapCenter={defaultMapCenter}
              onSelectParking={setSelectedParkingId}
            />
          )}
        </section>

        <ParkingDetailsPanel
          selectedParking={selectedParking}
          totalSpots={totalSpots}
          freeSpots={freeSpots}
          occupiedSpots={occupiedSpots}
          occupancyPercentage={occupancyPercentage}
        />
      </main>
    </div>
  );
}

export default App;
const db = require("./db");

const parking = {
  id: "parking_demo",
  name: "SmartParking demo lokacija",
  latitude: 45.8008,
  longitude: 15.9714,
};

const spots = [
  { label: "A1", occupied: 0, online: 1, source: "sensor" },
  { label: "A2", occupied: 1, online: 1, source: "simulation" },
  { label: "A3", occupied: 1, online: 1, source: "simulation" },
  { label: "A4", occupied: 0, online: 1, source: "simulation" },
  { label: "A5", occupied: 1, online: 1, source: "simulation" },
  { label: "A6", occupied: 0, online: 1, source: "simulation" },
  { label: "A7", occupied: 1, online: 1, source: "simulation" },
  { label: "A8", occupied: 1, online: 1, source: "simulation" },
  { label: "A9", occupied: 0, online: 1, source: "simulation" },
  { label: "A10", occupied: 1, online: 1, source: "simulation" },
  { label: "A11", occupied: 0, online: 1, source: "simulation" },
  { label: "A12", occupied: 0, online: 0, source: "simulation" },
];

db.serialize(() => {
  db.run(
    `
    INSERT OR IGNORE INTO parking (id, name, latitude, longitude)
    VALUES (?, ?, ?, ?)
    `,
    [parking.id, parking.name, parking.latitude, parking.longitude]
  );

  const insertSpot = db.prepare(`
    INSERT OR IGNORE INTO parking_spot 
    (parking_id, label, occupied, online, source)
    VALUES (?, ?, ?, ?, ?)
  `);

  spots.forEach((spot) => {
    insertSpot.run(
      parking.id,
      spot.label,
      spot.occupied,
      spot.online,
      spot.source
    );
  });

  insertSpot.finalize();

  console.log("Baza je napunjena početnim podacima.");
});

setTimeout(() => {
  db.close();
}, 500);
const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SmartParking backend radi.");
});

const server = app.listen(PORT, () => {
  console.log(`Backend radi na http://172.20.10.5:${PORT}`);
});

const wss = new WebSocketServer({ server });

function broadcast(message) {
  const jsonMessage = JSON.stringify(message);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(jsonMessage);
    }
  });
}

app.get("/api/parkings", (req, res) => {
  const query = `
    SELECT 
      p.id AS parking_id,
      p.name AS parking_name,
      p.latitude,
      p.longitude,
      ps.label AS spot_label,
      ps.occupied,
      ps.online,
      ps.source,
      ps.last_updated
    FROM parking p
    LEFT JOIN parking_spot ps ON p.id = ps.parking_id
    ORDER BY 
      p.id,
      substr(ps.label, 1, 1),
      CAST(substr(ps.label, 2) AS INTEGER)
  `;

  db.all(query, [], (error, rows) => {
    if (error) {
      return res.status(500).json({
        error: "Greška pri dohvaćanju parkinga.",
      });
    }

    const parkingMap = {};

    rows.forEach((row) => {
      if (!parkingMap[row.parking_id]) {
        parkingMap[row.parking_id] = {
          id: row.parking_id,
          name: row.parking_name,
          position: [row.latitude, row.longitude],
          lastUpdated: row.last_updated || "",
          spots: [],
        };
      }

      if (row.spot_label) {
        parkingMap[row.parking_id].spots.push({
          id: row.spot_label,
          occupied: Boolean(row.occupied),
          online: Boolean(row.online),
          source: row.source,
        });
      }
    });

    res.json(Object.values(parkingMap));
  });
});

app.post("/api/spot-update", (req, res) => {
  const {
    parkingId,
    spotId,
    occupied,
    online = true,
    source = "simulation",
    timestamp = new Date().toISOString(),
  } = req.body;

  if (!parkingId) {
    return res.status(400).json({
      error: "Nedostaje parkingId.",
    });
  }

  if (!spotId) {
    return res.status(400).json({
      error: "Nedostaje spotId.",
    });
  }

  if (typeof occupied !== "boolean") {
    return res.status(400).json({
      error: "Polje occupied mora biti boolean vrijednost: true ili false.",
    });
  }

  if (typeof online !== "boolean") {
    return res.status(400).json({
      error: "Polje online mora biti boolean vrijednost: true ili false.",
    });
  }

  if (source !== "simulation" && source !== "sensor") {
    return res.status(400).json({
      error: 'Polje source mora biti "simulation" ili "sensor".',
    });
  }

  if (Number.isNaN(Date.parse(timestamp))) {
    return res.status(400).json({
      error: "Polje timestamp nije ispravan datum/vrijeme.",
    });
  }

  const query = `
    UPDATE parking_spot
    SET occupied = ?, online = ?, source = ?, last_updated = ?
    WHERE parking_id = ? AND label = ?
  `;

  db.run(
    query,
    [
      occupied ? 1 : 0,
      online ? 1 : 0,
      source,
      timestamp,
      parkingId,
      spotId,
    ],
    function (error) {
      if (error) {
        return res.status(500).json({
          error: "Greška pri ažuriranju parking mjesta.",
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          error: `Parking mjesto ${spotId} na parkingu ${parkingId} nije pronađeno.`,
        });
      }

      const message = {
        type: "spot_update",
        parkingId,
        spotId,
        occupied,
        online,
        source,
        timestamp,
      };

      broadcast(message);

      res.json({
        success: true,
        message,
      });
    }
  );
});

wss.on("connection", () => {
  console.log("Frontend se spojio na WebSocket.");
});
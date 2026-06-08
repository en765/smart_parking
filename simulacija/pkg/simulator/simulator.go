package simulator

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"time"

	"smartparking/simulator/pkg/mqtt"
	"smartparking/simulator/pkg/parking"
)

type spotUpdate struct {
	ParkingID string `json:"parkingId"`
	SpotID    string `json:"spotId"`
	Occupied  bool   `json:"occupied"`
	Online    bool   `json:"online"`
	Source    string `json:"source"`
	Timestamp string `json:"timestamp"`
}

func Run(p parking.Parking, client *mqtt.Client) {
	// only simulation spots
	var spots []parking.Spot
	for _, s := range p.Spots {
		if s.Source == "simulation" {
			spots = append(spots, s)
		}
	}

	if len(spots) == 0 {
		log.Printf("[%s] no simulation spots found", p.ID)
		return
	}

	// state of parkings
	occupied := make(map[string]bool)
	for _, s := range spots {
		occupied[s.ID] = s.Occupied
	}

	// topic name for parking
	topic := fmt.Sprintf("smartparking/%s/spot_update", p.ID)

	for {
		// random delay
		time.Sleep(time.Duration(rand.Intn(6)+5) * time.Second)

		// pick random and change state
		spot := spots[rand.Intn(len(spots))]
		occupied[spot.ID] = !occupied[spot.ID]

		// construct the update
		msg := spotUpdate{
			ParkingID: p.ID,
			SpotID:    spot.ID,
			Occupied:  occupied[spot.ID],
			Online:    true,
			Source:    "simulation",
			Timestamp: time.Now().UTC().Format(time.RFC3339),
		}


		payload, err := json.Marshal(msg)
		if err != nil {
			log.Printf("[%s] marshal error: %v", p.ID, err)
			continue
		}

		if err := client.Publish(topic, payload); err != nil {
			log.Printf("[%s] publish error: %v", p.ID, err)
			continue
		}

		log.Printf("[%s] spot: %s, occupied=%v", p.ID, spot.ID, occupied[spot.ID])
	}
}

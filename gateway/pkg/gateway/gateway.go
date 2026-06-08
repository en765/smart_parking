package gateway

import (
	"encoding/json"
	"log"

	"smartparking/gateway/pkg/mqtt"
)

type spotUpdate struct {
	ParkingID string `json:"parkingId"`
	SpotID    string `json:"spotId"`
	Occupied  bool   `json:"occupied"`
	Online    bool   `json:"online"`
	Source    string `json:"source"`
	Timestamp string `json:"timestamp"`
}

func (s spotUpdate) valid() bool {
	return s.ParkingID != "" && s.SpotID != "" && s.Timestamp != ""
}

func Start(inputClient, outputClient *mqtt.Client, inputTopic, outputTopic string) error {
	return inputClient.Subscribe(inputTopic, func(payload []byte) {
		var msg spotUpdate
		if err := json.Unmarshal(payload, &msg); err != nil {
			log.Printf("[gateway] invalid JSON: %v", err)
			return
		}

		if !msg.valid() {
			log.Printf("[gateway] dropped incomplete message: %+v", msg)
			return
		}

		if err := outputClient.Publish(outputTopic, payload); err != nil {
			log.Printf("[gateway] publish error: %v", err)
			return
		}

		log.Printf("[gateway] forwarded %s/%s occupied=%v", msg.ParkingID, msg.SpotID, msg.Occupied)
	})
}

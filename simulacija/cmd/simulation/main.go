package main

import (
	"log"

	"smartparking/simulator/pkg/mqtt"
	"smartparking/simulator/pkg/parking"
	"smartparking/simulator/pkg/simulator"
	"smartparking/simulator/utils"
)

func main() {
	brokerURL := utils.Getenv("MQTT_BROKER", "tcp://localhost:1883")
	clientID := utils.Getenv("MQTT_CLIENT_ID", "smartparking-simulator")
	username := utils.Getenv("MQTT_USERNAME", "smartparking")
	password := utils.Getenv("MQTT_PASSWORD", "parking123")
	backendURL := utils.Getenv("BACKEND_URL", "http://localhost:3000")

	parkings, err := parking.Fetch(backendURL)
	if err != nil {
		log.Fatalf("failed to fetch parkings: %v", err)
	}

	mqttClient, err := mqtt.New(brokerURL, clientID, username, password)
	if err != nil {
		log.Fatalf("failed to connect to MQTT broker: %v", err)
	}

	defer mqttClient.Close()

	log.Printf("starting simulation for %d parkings", len(parkings))

	for _, p := range parkings {
		go simulator.Run(p, mqttClient)
	}

	select {}
}

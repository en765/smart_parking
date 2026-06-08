package main

import (
	"log"

	"smartparking/gateway/pkg/gateway"
	"smartparking/gateway/pkg/mqtt"
	"smartparking/gateway/utils"
)

func main() {
	inputBroker := utils.Getenv("MQTT_INPUT_BROKER", "tcp://localhost:1883")
	inputClientID := utils.Getenv("MQTT_INPUT_CLIENT_ID", "smartparking-gateway-in")
	inputUsername := utils.Getenv("MQTT_INPUT_USERNAME", "smartparking")
	inputPassword := utils.Getenv("MQTT_INPUT_PASSWORD", "parking123")

	outputBroker := utils.Getenv("MQTT_OUTPUT_BROKER", "tcp://localhost:1883")
	outputClientID := utils.Getenv("MQTT_OUTPUT_CLIENT_ID", "smartparking-gateway-out")
	outputUsername := utils.Getenv("MQTT_OUTPUT_USERNAME", "smartparking")
	outputPassword := utils.Getenv("MQTT_OUTPUT_PASSWORD", "parking123")

	inputTopic := utils.Getenv("TOPIC_INPUT", "smartparking/+/spot_update")
	outputTopic := utils.Getenv("TOPIC_OUTPUT", "v1/devices/me/telemetry")

	inputClient, err := mqtt.New(inputBroker, inputClientID, inputUsername, inputPassword)
	if err != nil {
		log.Fatalf("failed to connect to input broker: %v", err)
	}

	defer inputClient.Close()

	outputClient, err := mqtt.New(outputBroker, outputClientID, outputUsername, outputPassword)
	if err != nil {
		log.Fatalf("failed to connect to output broker: %v", err)
	}

	defer outputClient.Close()

	log.Printf("subscribing to %s, forwarding to %s", inputTopic, outputTopic)

	if err := gateway.Start(inputClient, outputClient, inputTopic, outputTopic); err != nil {
		log.Fatalf("failed to subscribe: %v", err)
	}

	select {}
}

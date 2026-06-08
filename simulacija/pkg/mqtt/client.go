package mqtt

import (
	paho "github.com/eclipse/paho.mqtt.golang"
)

type Client struct {
	client paho.Client
}

func New(brokerURL, clientID, username, password string) (*Client, error) {
	opts := paho.NewClientOptions().
		AddBroker(brokerURL).
		SetClientID(clientID).
		SetUsername(username).
		SetPassword(password)

	c := paho.NewClient(opts)
	if token := c.Connect(); token.Wait() && token.Error() != nil {
		return nil, token.Error()
	}

	return &Client{client: c}, nil
}

func (c *Client) Publish(topic string, payload []byte) error {
	token := c.client.Publish(topic, 0, false, payload)
	token.Wait()
	return token.Error()
}

func (c *Client) Close() {
	c.client.Disconnect(250)
}

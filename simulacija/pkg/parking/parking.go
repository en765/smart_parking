package parking

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Spot struct {
	ID       string `json:"id"`
	Occupied bool   `json:"occupied"`
	Online   bool   `json:"online"`
	Source string `json:"source"`
}

type Parking struct {
	ID       string    `json:"id"`
	Name     string    `json:"name"`
	Position []float64 `json:"position"`
	Spots    []Spot    `json:"spots"`
}

func Fetch(backendURL string) ([]Parking, error) {
	resp, err := http.Get(fmt.Sprintf("%s/api/parkings", backendURL))
	if err != nil {
		return nil, err
	}
	
	defer resp.Body.Close()

	var parkings []Parking
	if err := json.NewDecoder(resp.Body).Decode(&parkings); err != nil {
		return nil, err
	}

	return parkings, nil
}

package utils

import "os"

func Getenv(key, fallback string) string {
	val := os.Getenv(key)

	if val != "" {
		return val
	}
	
	return fallback
}

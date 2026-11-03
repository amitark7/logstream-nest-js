package models

import "time"

type JSONData struct {
	RequestID    string `json:"requestId"`
	OrderID      string `json:"orderId"`
	ErrorCode    string `json:"errorCode"`
	RetryAttempt int    `json:"retryAttempt"`
}

type Data struct {
	ID        string    `json:"id"`
	Level     string    `json:"level"`
	Message   string    `json:"message"`
	Service   string    `json:"service"`
	Timestamp time.Time `json:"timestamp"`
	Metadata  JSONData  `json:"metadata"`
}

type EventData struct {
	EventID    string `json:"eventId"`
	EventType  string `json:"eventType"`
	Version    int    `json:"version"`
	OccurredAt string `json:"occurredAt"`
	Data       Data   `json:"data"`
}

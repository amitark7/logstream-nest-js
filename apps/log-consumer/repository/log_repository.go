package repository

import (
	"context"
	"log-consumer/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

func SaveLog(ctx context.Context, db *pgxpool.Pool, event models.EventData) error {
	query := `
        INSERT INTO processed_logs (
            id,
            event_id,
            level,
            message,
            service,
            log_timestamp,
            metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `

	_, err := db.Exec(ctx, query, event.Data.ID, event.EventID, event.Data.Level, event.Data.Message, event.Data.Service, event.Data.Timestamp, event.Data.Metadata)

	if err != nil {
		return err
	}

	return nil
}

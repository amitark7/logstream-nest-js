package database

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func ConnectPostgre() *pgxpool.Pool {
	databaseURL := os.Getenv("DATABASE_URL")

	if databaseURL == "" {
		databaseURL = "postgres://logstream:logstream_dev_password@localhost:5432/logstream"
	}

	ctx, cancel := context.WithTimeout(
		context.Background(),
		5*time.Second,
	)
	defer cancel()

	pool, err := pgxpool.New(ctx, databaseURL)

	if err != nil {
		log.Printf("Unnable to connect PostgreSql: %v", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		log.Printf("PostgreSql is not responding : %v", err)
	}

	log.Printf("Succesfully connected to PostgreSql")

	return pool
}

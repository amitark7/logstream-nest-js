package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"log-consumer/database"
	"log-consumer/models"
	"log-consumer/repository"
	"os"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	amqb "github.com/rabbitmq/amqp091-go"
)

func main() {
	rabbitMQURL := os.Getenv("RABBITMQ_URL")

	if rabbitMQURL == "" {
		rabbitMQURL = "amqp://logstream:logstream_dev_password@localhost:5672/"
	}

	conn, err := amqb.Dial(rabbitMQURL)

	if err != nil {
		log.Fatalf("Failed to connect RabbitMQ: %v", err)
	}
	defer conn.Close()

	log.Println("Successfully connected to RabbitMQ")

	db := database.ConnectPostgre()
	defer db.Close()

	var wg sync.WaitGroup

	// queues := []string{
	// 	"logs.error.queue",
	// 	"logs.info.queue",
	// 	"logs.warn.queue",
	// }

	workerID := os.Getenv("WORKER_ID")

	if workerID == "" {
		workerID = "worker_deafult"
	}

	log.Printf("Starting worker: %s", workerID)

	if err := ConsumeQueue(conn, db, "logs.error.queue", workerID); err != nil {
		log.Fatalf("Consumer failed: %v", err)
	}
	//Three worker loop
	// for i := 1; i <= 3; i++ {
	// 	wg.Add(1)

	// 	go func(workerID int) {
	// 		defer wg.Done()
	// 		log.Printf("Starting ERROR worker %d", workerID)

	// 		if err := ConsumeQueue(conn, db, "logs.error.queue", workerID); err != nil {
	// 			log.Printf("Worker %d failed: %v", workerID, err)
	// 		}
	// 	}(i)
	// }

	// for _, queue := range queues {
	// 	wg.Add(1)

	// 	go func(queueName string) {
	// 		defer wg.Done()
	// 		if err := ConsumeQueue(conn, db, queueName); err != nil {
	// 			log.Printf("Consumer failed for %s : %v", queueName, err)
	// 		}
	// 	}(queue)
	// }

	wg.Wait()
}

func ConsumeQueue(conn *amqb.Connection, db *pgxpool.Pool, queueName string, workerID string) error {
	ch, err := conn.Channel()

	if err != nil {
		return fmt.Errorf("failed to open RabbitMQ channel: %w", err)
	}
	defer ch.Close()
	log.Printf("RabbitMQ channel created succesfully")

	err = ch.Qos(
		1,
		0,
		false,
	)

	if err != nil {
		return fmt.Errorf("Failed to configured Qos :%v", err)
	}

	messages, err := ch.Consume(
		queueName,
		"",
		false,
		false,
		false,
		false,
		nil,
	)

	if err != nil {
		return fmt.Errorf("failed to consume queue %s: %w", queueName, err)
	}

	log.Printf("Consumer started :%s", queueName)

	for message := range messages {
		var event models.EventData

		err := json.Unmarshal(message.Body, &event)

		if err != nil {
			log.Printf("Failed to decode message : %v", err)

			if nackErr := message.Nack(false, false); nackErr != nil {
				log.Printf("Failed to reject message :%v", nackErr)
			}
			continue
		}
		log.Printf(
			"Worker %s received message: %s",
			workerID,
			event.EventID,
		)

		ctx, cancel := context.WithTimeout(
			context.Background(),
			5*time.Second,
		)

		err = repository.SaveLog(ctx, db, event)

		cancel()

		if err != nil {
			log.Printf("Failed to save log in PostgreSQL :%v", err)
			if nackErr := message.Nack(false, false); nackErr != nil {
				log.Printf("Failed tp reject message: %v", nackErr)
			}
			continue
		}

		log.Printf(
			"Worker %s saved log: %s",
			workerID,
			event.Data.ID,
		)

		if err := message.Ack(false); err != nil {
			log.Printf("Failed to acknownledge succesfully :%v", err)
			continue
		}

		log.Printf("Message Proccesed Succesfully ")
	}

	return nil
}

# Stage 1: Build the Go application
FROM golang:1.27.2-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy application source code
COPY . .

# Build a Linux executable
RUN CGO_ENABLED=0 GOOS=linux go build -o log-consumer .

# Stage 2: Create a lightweight runtime image
FROM alpine:3.22

WORKDIR /app

# Install CA certificates for secure network connections
RUN apk --no-cache add ca-certificates

# Copy only the compiled executable from builder
COPY --from=builder /app/log-consumer .

# Start the consumer
CMD ["./log-consumer"]
#!/bin/bash

# Check if the environment file argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 path/to/your/.env"
  exit 1
fi

ENV_FILE=$1
echo "ENV FILE IS: $ENV_FILE"

# Function to stop Docker Compose services
stop_when_command() {
  echo "Stopping Docker Compose services due to command..."
  docker-compose --env-file "$ENV_FILE" down
  echo "Docker Compose services stopped."
  kill -- -$$
  exit 0
}

# Trap termination signals (e.g., SIGINT, SIGTERM) to stop services
trap stop_when_command SIGINT SIGTERM

# Teardown existing Docker Compose services if they are running
echo "Checking if Docker Compose services are already running..."
if docker-compose --env-file "$ENV_FILE" ps | grep -q "Up"; then
  echo "Docker Compose services are already running. Tearing down existing services..."
  docker-compose --env-file "$ENV_FILE" down
  echo "Existing services have been stopped."
fi

# Start the Docker Compose services
echo "Starting Docker Compose services..."
docker-compose --env-file "$ENV_FILE" up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."

# Function to check if all services are healthy
check_health() {
  local retries=6
  local count=0
  local sleep_time=5

  while [ $count -lt $retries ]; do
    unhealthy_services=$(docker-compose --env-file "$ENV_FILE" ps | grep -E "Exit|unhealthy|starting" | wc -l)
    if [ "$unhealthy_services" -eq 0 ]; then
      echo "All services are healthy."
      return 0
    else
      echo "Waiting for services to become healthy... (Attempt: $((count+1))/$retries, $((sleep_time*count))s)"
      sleep $sleep_time
      count=$((count+1))
    fi
  done

  echo "Some services are still not healthy after $retries attempts."
  return 1
}

# Check health of the services
if ! check_health; then
  echo "ERROR: Some services failed to become healthy. Exiting."
  # Optionally, bring down the Docker Compose services on failure
  docker-compose --env-file "$ENV_FILE" down
  exit 1
fi

# Run application commands in the background
echo "Starting application."
yarn dev:ts-node:producer &

# Wait for application command to complete or be interrupted
wait $!

echo "Shutdown application completed"

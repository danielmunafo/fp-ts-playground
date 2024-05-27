#!/bin/bash

# Change to the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Path to the project directory containing docker-compose.yml
PROJECT_DIR="$SCRIPT_DIR"

# Navigate to the project directory
cd "$PROJECT_DIR" || exit

# Function to stop Docker Compose services
stop_when_command() {
  echo "Stopping Docker Compose services due to command..."
  docker-compose down
  echo "Docker Compose services stopped."
}

# Trap termination signals (e.g., SIGINT, SIGTERM) to stop services
trap stop_when_command SIGINT SIGTERM

# Teardown existing Docker Compose services if they are running
echo "Checking if Docker Compose services are already running..."
if docker-compose ps | grep -q "Up"; then
  echo "Docker Compose services are already running. Tearing down existing services..."
  docker-compose down
  echo "Existing services have been stopped."
fi

# Build the Docker images
echo "Building Docker images..."
docker-compose build

# Start the Docker Compose services
echo "Starting Docker Compose services..."
docker-compose up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."

# Function to check if all services are healthy
check_health() {
  local retries=5
  local count=0

  while [ $count -lt $retries ]; do
    unhealthy_services=$(docker-compose ps | grep -E "Exit|unhealthy|starting" | wc -l)
    if [ "$unhealthy_services" -eq 0 ]; then
      echo "All services are healthy."
      return 0
    else
      echo "Waiting for services to become healthy... (Attempt: $((count+1))/$retries)"
      sleep 10
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
  docker-compose down
  exit 1
fi

# Run application commands
echo "Starting application."
yarn dev:ts-node:producer

echo "Shutdown application completed."
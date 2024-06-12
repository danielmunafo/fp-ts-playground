#!/bin/bash

ENV_FILE=../../config/.env.test
echo "ENV FILE IS: $ENV_FILE"

# Function to stop Docker Compose services with '-test' suffix
stop_test_services() {
  echo "Stopping Docker Compose services with '-test' suffix..."
  services=$(docker-compose --env-file "$ENV_FILE" -f ./docker-compose.yaml ps --services | grep '\-test')
  if [ -n "$services" ]; then
    docker-compose --env-file "$ENV_FILE" -f ./docker-compose.yaml stop $services
    docker-compose --env-file "$ENV_FILE" -f ./docker-compose.yaml rm -f $services
    echo "Docker Compose services with '-test' suffix stopped."
  else
    echo "No '-test' services found to stop."
  fi
}

stop_test_services

# Start the Docker Compose services
echo "Starting Docker Compose services..."
docker-compose --env-file "$ENV_FILE" -f ./docker-compose.yaml up -d

# Wait for services to be healthy
echo "Waiting for services to be healthy..."

# Function to check if all services are healthy
check_health() {
  local retries=10
  local count=0
  local sleep_time=5

  while [ $count -lt $retries ]; do
    unhealthy_services=$(docker-compose --env-file "$ENV_FILE" -f ./docker-compose.yaml ps | grep -E '\-test' | grep -E "Exit|unhealthy|starting" | wc -l)
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
  docker-compose --env-file "$ENV_FILE" -f ./docker-compose.yaml down
  exit 1
fi

echo "Running Jest tests..."
npx jest --config ./jest.integrated.config.ts
TEST_EXIT_CODE=$?

# Stop Docker Compose services
echo "Stopping Docker Compose services..."
stop_test_services

# Exit with the Jest test exit code
exit $TEST_EXIT_CODE
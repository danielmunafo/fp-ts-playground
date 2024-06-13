#!/bin/bash

ENV_FILE=../../config/.env.test
COMPOSE_FILE=./docker-compose.yaml
echo "ENV FILE IS: $ENV_FILE"
echo "COMPOSE FILE IS: $COMPOSE_FILE"

# Function to stop Docker Compose services with '-test' suffix
stop_test_services() {
  echo "Stopping Docker Compose services with '-test' suffix..."
  services=$(docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps --services | grep '\-test')
  if [ -n "$services" ]; then
    docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" stop $services
    docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" rm -f $services
    echo "Docker Compose services with '-test' suffix stopped."
  else
    echo "No '-test' services found to stop."
  fi
}

# Function to start Docker Compose services
start_test_services() {
  echo "Starting Docker Compose services..."
  docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d
}

# Function to check if all services with '-test' suffix are healthy
check_health() {
  local retries=10
  local count=0
  local sleep_time=5

  while [ $count -lt $retries ]; do
    unhealthy_services=$(docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps | grep -E '\-test' | grep -E "Exit|unhealthy|starting" | wc -l)
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

# Stop any running test services before starting
stop_test_services

# Get the list of test files to run
TEST_FILES=$(npx jest --config ./jest.integrated.config.ts --listTests | grep '\.integrated\.spec\.ts')

# Loop through each test file and run them individually
for TEST_FILE in $TEST_FILES; do
  echo "Running test file: $TEST_FILE"

  # Start the Docker Compose services
  start_test_services

  # Check health of the services
  if ! check_health; then
    echo "ERROR: Some services failed to become healthy. Exiting."
    stop_test_services
    exit 1
  fi

  # Run the individual Jest test with detectOpenHandles
  npx jest --config ./jest.integrated.config.ts $TEST_FILE --detectOpenHandles
  TEST_EXIT_CODE=$?

  # Stop Docker Compose services
  stop_test_services

  # Exit if the test failed
  if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo "Test failed: $TEST_FILE"
    exit $TEST_EXIT_CODE
  fi

  echo "Test passed: $TEST_FILE"
done

# Exit with a success code if all tests passed
exit 0

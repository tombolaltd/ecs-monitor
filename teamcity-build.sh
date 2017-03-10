#!/bin/bash

BUILD_NUMBER=$1

echo "Logging in to Amazon ECR..."
$(aws ecr get-login --registry-ids 160821142532 --region eu-west-1)

echo "Building and tagging platform/ecs-monitor..."
docker build -t platform/ecs-monitor .
docker tag platform/logging-api:latest 160821142532.dkr.ecr.eu-west-1.amazonaws.com/platform/ecs-monitor:latest
docker tag platform/logging-api:latest 160821142532.dkr.ecr.eu-west-1.amazonaws.com/platform/ecs-monitor:v$BUILD_NUMBER
echo "platform/ecs-monitor built and tagged successfully"

echo "Pushing platform/ecs-monitor image..."
docker push 160821142532.dkr.ecr.eu-west-1.amazonaws.com/platform/ecs-monitor:latest
docker push 160821142532.dkr.ecr.eu-west-1.amazonaws.com/platform/ecs-monitor:v$BUILD_NUMBER

echo "All images pushed successfully"
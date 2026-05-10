#!/usr/bin/env sh
# Example: push API image to Amazon ECR (replace variables; do not commit secrets).
#
# Prerequisites: aws CLI v2, docker, ECR repository created, docker login to ECR.
#
# Usage:
#   export AWS_REGION=us-east-1
#   export AWS_ACCOUNT_ID=123456789012
#   export ECR_REPO=examwizards-api
#   sh deploy/scripts/push-ecr.example.sh

set -eu

: "${AWS_REGION:?}"
: "${AWS_ACCOUNT_ID:?}"
: "${ECR_REPO:?}"

IMAGE_TAG="${IMAGE_TAG:-git-$(git rev-parse --short HEAD 2>/dev/null || echo local)}"
REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
URI="${REGISTRY}/${ECR_REPO}:${IMAGE_TAG}"

echo "Logging in to ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${REGISTRY}"

echo "Building backend image from repository root..."
docker build -t "${ECR_REPO}:${IMAGE_TAG}" -f backend/Dockerfile backend

docker tag "${ECR_REPO}:${IMAGE_TAG}" "${URI}"
echo "Pushing ${URI}"
docker push "${URI}"

echo "Done. Use this URI in ecs-task-definitions or Terraform."

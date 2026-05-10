# Observability

## Logs

- **ECS**: `awslogs` driver → CloudWatch log group per service (see `ecs-task-definitions/`).  
- **Structured JSON**: optional Logback JSON encoder in Spring for queryable fields (`traceId`, `user`, `path`).

## Metrics and traces

- **CloudWatch** for infrastructure and JVM custom metrics (Micrometer → CloudWatch in AWS environments).  
- **AWS X-Ray** optional: enable with OpenTelemetry agent sidecar or SDK integration when tracing becomes a requirement.

## Redis / SQS

- When ElastiCache and SQS are introduced, add CloudWatch metrics for **cache hit rate**, **queue depth**, and **DLQ** alarms.

This directory is intentionally **documentation-first**; add `otel-collector.yaml` or ADOT configs when you wire tracing in a specific environment.

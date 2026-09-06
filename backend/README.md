# The Journal backend

This directory contains the Spring Boot 3.3 / Java 21 API for The Journal. The
repository-level [`README.md`](../README.md) is the source of truth for the full
Angular, React, and backend architecture, local setup, API contract, testing,
and deployment instructions.

## Run locally

Start MongoDB, Redis, and Kafka from this directory:

```bash
docker compose up -d
```

Then configure the required environment variables and start the API:

```bash
cd journaling
./mvnw spring-boot:run
```

On Windows PowerShell, use `./mvnw.cmd spring-boot:run`.

The API listens on `http://localhost:8080` by default. Useful production-support
endpoints are:

- Health: `GET /actuator/health`
- OpenAPI: `GET /v3/api-docs`
- Swagger UI: `/swagger-ui/index.html`

## Verify

```bash
cd journaling
./mvnw verify
```

The test suite uses JUnit 5, Mockito, and MockMvc. JaCoCo creates its coverage
report at `target/site/jacoco/` during `verify`.

Do not commit credentials. All MongoDB, Redis, Kafka, mail, JWT, weather-service,
and CORS settings are externalized; see the root README for their names and
defaults.

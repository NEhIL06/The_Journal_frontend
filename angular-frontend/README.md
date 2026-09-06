# The Journal Angular client

This is the standalone Angular 21 client for The Journal. It provides
registration, login/logout, protected routing, and complete journal CRUD using
the existing Spring Boot API contract.

The repository-level [`README.md`](../README.md) contains the architecture,
environment variables, API contract, screenshots, and deployment guide.

## Commands

```bash
npm ci
npm start          # development server at http://localhost:4200
npm run test:ci    # one-shot Vitest unit suite
npm run build      # optimized production bundle
```

Development and production API URLs live in `src/environments/`. Do not put API
URLs directly in components or services.

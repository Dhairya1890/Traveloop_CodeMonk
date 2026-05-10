# Traveloop Project Plan

## Current State

The repository already has the intended full-stack shape for Traveloop, but most implementation files are still placeholders or empty. The strongest signals are:

- The product intent is documented in [project.md](project.md).
- The setup assumptions are documented in [readme.md](readme.md) and [client/README.md](client/README.md).
- The client has a Vite + React + Tailwind toolchain and the expected libraries installed.
- The server has Express, Sequelize, MySQL, auth, and validation dependencies installed.
- The actual runtime entry points and feature modules are not yet implemented.

## Codebase Findings

### Frontend

- [client/src/App.jsx](client/src/App.jsx) is an empty component shell.
- [client/src/context/authContext.jsx](client/src/context/authContext.jsx) is empty.
- [client/src/hooks/useAuth.js](client/src/hooks/useAuth.js) is empty.
- [client/src/store/tripStore.js](client/src/store/tripStore.js) is empty.
- Several page files under [client/src/pages](client/src/pages) are present but not implemented.
- The app bootstrap in [client/src/main.jsx](client/src/main.jsx) is valid, but it currently renders an empty UI.

### Backend

- [server/app.js](server/app.js) is empty.
- [server/server.js](server/server.js) is empty.
- Core controllers and routes such as [server/controllers/authController.js](server/controllers/authController.js), [server/controllers/tripController.js](server/controllers/tripController.js), and [server/routes/trips.js](server/routes/trips.js) are empty.
- [server/models/index.js](server/models/index.js) is the default Sequelize bootstrap, but there are no concrete model files yet.
- [server/config/config.json](server/config/config.json) still contains the default Sequelize database names and root credentials, so it is not production-ready.

## Main Gaps

1. No working API server entry point.
2. No implemented data models or migrations.
3. No authentication flow.
4. No trip management UI or routing.
5. No shared API client or error handling layer on the frontend.
6. No seed data or sample cities/activities to power the app experience.

## Recommended Delivery Plan

### Phase 1: Bootstrap the foundation

- Implement the Express app setup in [server/app.js](server/app.js) and [server/server.js](server/server.js).
- Wire middleware for CORS, JSON parsing, logging, helmet, and error handling.
- Add environment-based configuration and remove hardcoded DB defaults.
- Implement health and version endpoints so the backend can be verified quickly.

### Phase 2: Data layer and core entities

- Define Sequelize models for users, trips, cities, stops, activities, budgets, notes, and packing items.
- Add migrations and seeders for the initial city/activity catalog.
- Establish model relationships and association helpers.
- Validate the database workflow end to end.

### Phase 3: Authentication and user identity

- Implement signup, login, logout, and token verification.
- Add password hashing and JWT middleware.
- Build the React auth context and auth hook in the client.
- Protect private routes and API endpoints.

### Phase 4: Trip planning workflow

- Implement trip creation, editing, deletion, and listing.
- Add itinerary/stops management.
- Connect the trip store and pages to live API data.
- Render a first usable dashboard for upcoming and past trips.

### Phase 5: Supporting trip tools

- Add budget tracking, packing checklist, trip notes, and activity search.
- Build reusable UI states for loading, empty, and error conditions.
- Add filtering, sorting, and simple analytics where useful.

### Phase 6: Polish and release readiness

- Harden validation and API error messages.
- Add tests for critical backend routes and frontend state flows.
- Improve responsive layout and accessibility.
- Replace placeholder screens with production-ready navigation and content.

## Suggested Milestones

### Milestone 1

Working backend shell, database connection, and health check.

### Milestone 2

Authentication and a minimal protected dashboard.

### Milestone 3

Trip CRUD and itinerary management.

### Milestone 4

Budget, packing, notes, and activity features.

### Milestone 5

Testing, polish, and deployment preparation.

## Risks To Address Early

- Empty server entry points mean the API cannot start yet.
- Default Sequelize config and root DB credentials are unsafe.
- The current frontend has no real state management or data fetching behavior.
- Without seed data, the travel experience will feel blank even after the UI is built.

## Immediate Next Actions

1. Implement the backend app bootstrap and a health endpoint.
2. Define the first database models and migrations.
3. Build the auth flow and connect the frontend context layer.
4. Add the first usable dashboard and trip list screen.

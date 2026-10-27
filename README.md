# CivicAlert

CivicAlert is a full-stack civic reporting application with a Spring Boot backend, a web-based administration interface, and a resident-facing mobile application. The project brings these application components together in one repository.

> **Project status:** This README documents the current repository structure and the technologies visible in the checked-in configuration. Confirm each feature and setup step in a running local environment before using this project for a formal demonstration.

## Repository structure

```text
.
├── src/                       # Spring Boot backend source and tests
├── pom.xml                    # Maven build configuration
├── mvnw / mvnw.cmd            # Maven Wrapper
├── civicalert-frontend/       # React + Vite web administration interface
└── civicalert-mobile/         # Expo + React Native mobile application
```

## Technology stack

| Component | Technologies |
|---|---|
| Backend | Java, Spring Boot, Spring MVC, Spring Data JPA, Spring Security |
| Authentication/security | Spring Security OAuth2 Resource Server support and JWT-related service code |
| Database | MySQL with the MySQL Connector/J driver |
| Server-rendered views | Thymeleaf dependency is included in the backend |
| Admin web interface | React, React Router, Vite |
| Resident mobile app | React Native, Expo, Expo Router, TypeScript |
| Version control | Git and GitHub |

The backend build configuration currently declares Spring Boot **4.1.2** and Java **25**. Check the compiler configuration in `pom.xml` and the Java version installed on your machine if the build reports a version mismatch.

## Application areas

### Backend
The Spring Boot application is located under `src/main/java/com/example/spcrud`. The repository includes controller, DTO, entity, security, and service packages. Service classes include authentication/JWT-related logic, report-related logic, and account deactivation/deletion logic.

### Administration web interface
The React/Vite application is in `civicalert-frontend/`. Its package scripts include development, production build, lint, and preview commands.

### Resident mobile application
The Expo/React Native application is in `civicalert-mobile/`. Its routes include home, explore, and reports-related screens. The dependency list includes location, maps, image picker, secure storage, and asynchronous storage packages; the presence of a dependency alone does not guarantee that a feature is fully configured or tested.

## Prerequisites

Install the tools appropriate to the parts you want to run:

- A JDK compatible with the backend's Maven/compiler configuration.
- MySQL Server.
- Node.js and npm.
- Git.
- Android Studio/emulator or a compatible device for Android testing; Expo tooling can also be used for other supported targets.

## Configuration and secrets

The application's local Spring configuration is intentionally not committed. Before starting the backend:

1. Create or configure your local `src/main/resources/application.properties` file.
2. Configure your local MySQL database and database credentials.
3. Configure any authentication/JWT secrets required by the backend.
4. Never commit real passwords, tokens, database credentials, or production secrets.

Use placeholder values in shared documentation and keep real secrets in local-only configuration or a suitable secret manager. The exact configuration keys should be checked against the backend code and your local configuration.

## Running locally

Run commands from the repository root unless a different directory is specified.

### 1. Start the backend

Ensure MySQL is running and the local Spring configuration is complete. Then run:

**Windows PowerShell**
```powershell
.\mvnw.cmd spring-boot:run
```

**macOS/Linux**
```bash
./mvnw spring-boot:run
```

If startup fails, review the terminal output for Java version, database connection, schema, or missing configuration errors.

### 2. Start the admin web interface

Open a second terminal:

```powershell
cd civicalert-frontend
npm install
npm run dev
```

Vite prints the local development URL in the terminal. Confirm the backend API URL and any frontend environment configuration match your local setup before testing sign-in or API-driven pages.

Useful scripts:
```bash
npm run build
npm run lint
npm run preview
```

### 3. Start the resident mobile app

Open another terminal:

```powershell
cd civicalert-mobile
npm install
npx expo start
```

Use the Expo CLI options shown in the terminal to open the app in a supported emulator or device. Check the app's API base URL and device network access: a phone cannot normally reach a backend using the computer's `localhost` address.

## Testing and verification

The backend contains a test source tree under `src/test/java`. The Maven test command is:

```powershell
.\mvnw.cmd test
```

The web frontend includes a lint script and a production build script. The mobile project includes an Expo lint script. Run these checks locally and record their actual results before claiming that the project passes tests.

Suggested verification checklist:

- [ ] Backend starts with the intended local database.
- [ ] Authentication works for the intended account types.
- [ ] Report-related workflows work from the resident app.
- [ ] Administrative workflows work in the web interface.
- [ ] Backend authorization is enforced for protected operations.
- [ ] Web production build completes successfully.
- [ ] Mobile app launches on the target device/emulator.
- [ ] No secrets or local-only configuration are committed.

## Version control

The source is hosted on GitHub:

https://github.com/lsdarchives/CivicAlert---Mvp

The default development branch currently used for the initial upload is `master`.

## Known documentation gaps

This README is a starting point. Before a release or formal assessment, update it with verified details from the application:

- A concise problem statement and intended users.
- Confirmed feature descriptions and screenshots.
- Database schema/ER diagram.
- API routes and request/response examples.
- Exact local configuration keys and frontend API URL setup (without secrets).
- Verified test/build results.
- Deployment instructions, if deployment is implemented.

## Security note

Do not publish local configuration files, JWT signing secrets, passwords, private keys, crash dumps, build output, or dependency folders. Review `.gitignore` and the repository's tracked files before making the repository public.

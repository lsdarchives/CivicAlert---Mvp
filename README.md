# CivicAlert — Full-Stack Civic Issue Reporting System

## 1. Project Overview

CivicAlert is a full-stack civic issue-reporting MVP designed to connect residents who report community problems with administrators who manage and review those reports.

The repository contains three main application components:

1. **Spring Boot backend** — handles API requests, authentication, application logic, and database access.
2. **React web administration interface** — provides an interface for administrators to sign in and manage community reports.
3. **Expo/React Native resident mobile application** — provides resident-facing login, community reporting, and report-tracking screens.

The application is intended to support reporting issues such as potholes, damaged streetlights, waste collection problems, water leaks, and other local service concerns.

**Important status distinction:** This repository contains implementation code for the features documented below. The existence of source code does not prove that every workflow has passed end-to-end testing. Any presentation or report must distinguish implemented code, verified behaviour, known defects, and proposed improvements.

**GitHub repository:** https://github.com/lsdarchives/CivicAlert---Mvp  
**Branch used for the initial upload:** `master`

---

## 2. Problem Statement

Residents may encounter local infrastructure or service-delivery problems but lack a convenient way to submit a report, keep track of it, or see issues reported by other members of their community.

Administrators also need a central interface for reviewing submitted reports and updating their progress.

CivicAlert aims to provide a digital reporting workflow through a resident mobile interface, an administration dashboard, a central backend, and a relational database.

### Project objectives

- Provide a resident-facing interface for account access and civic issue reporting.
- Capture report details, including title, description, category, and optional location information.
- Generate a reference number for each report.
- Allow residents to view their own reports and their statuses.
- Provide a community report feed.
- Give administrators a web interface for viewing and managing reports.
- Introduce account authentication and role-aware access.
- Store users, reports, comments, and reactions in a relational data model.
- Support account profile updates, password changes, and account deactivation.
- Maintain a version-controlled codebase that can be reviewed and extended.

These objectives describe the purpose of the project; do not present them as proof that every requirement has been fully tested.

---

## 3. Repository Structure

The repository root is the Spring Boot Maven project.

```text
CivicAlert---Mvp/
├── src/
│   ├── main/
│   │   ├── java/com/example/spcrud/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── repository/
│   │   │   ├── security/
│   │   │   └── service/
│   │   └── resources/
│   └── test/
│       └── java/com/example/spcrud/
├── civicalert-frontend/
│   ├── src/
│   ├── package.json
│   └── Vite configuration
├── civicalert-mobile/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── services/
│   └── package.json
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .gitignore
└── README.md
```

### Backend package responsibilities

- `config/` — JWT and Spring Security configuration.
- `controller/` — HTTP endpoints for authentication, reports, accounts, and community interactions.
- `dto/` — request and response objects.
- `entity/` — JPA entities representing persisted data.
- `repository/` — database access interfaces.
- `security/` — security-related filters, including enabled-account enforcement.
- `service/` — business logic for users, authentication, JWT handling, reports, and account lifecycle operations.

The web and mobile applications have separate package manifests and development commands. They are separate clients of the backend rather than a single frontend application.

---

## 4. Technology Stack

### Backend

- Java
- Spring Boot
- Spring MVC and REST controllers
- Spring Data JPA
- Jakarta Persistence
- Spring Security
- OAuth2 Resource Server support
- JWT-related services and configuration
- MySQL Connector/J
- Maven and Maven Wrapper
- Thymeleaf dependency

The current `pom.xml` declares Spring Boot `4.1.2` and Java `25`. It also configures the Maven compiler plugin with source and target `16`. This version mismatch should be reviewed and resolved before documenting the final supported Java version.

Thymeleaf is listed as a dependency, but its presence alone does not prove that the current user interfaces use server-rendered Thymeleaf pages.

### Administration frontend

- React
- React DOM
- React Router
- Vite
- JavaScript and JSX
- CSS
- ESLint

The frontend package includes scripts for development, production builds, linting, and previewing a production build.

### Resident mobile frontend

- React Native
- Expo
- Expo Router
- TypeScript
- Expo SecureStore
- AsyncStorage dependency
- Expo Location dependency
- React Native Maps dependency
- Expo Image Picker dependency

The presence of location, maps, and image-picker packages should not be described as a fully completed feature without verifying the relevant implementation and testing it.

### Database

- MySQL
- JPA entity mapping
- Spring Data repository interfaces

### Version control

- Git
- GitHub

---

## 5. System Architecture

CivicAlert follows a client-server architecture with a shared backend.

```text
┌─────────────────────────┐
│ Resident Mobile App     │
│ Expo + React Native     │
└────────────┬────────────┘
             │
             │ HTTP / JSON
             │ Bearer JWT
             ▼
┌─────────────────────────┐
│ Spring Boot Backend     │
│                         │
│ REST Controllers        │
│ Security / JWT          │
│ Services                │
│ DTOs                    │
│ Repositories            │
└────────────┬────────────┘
             │
             │ JPA
             ▼
┌─────────────────────────┐
│ MySQL Database          │
│ Users                   │
│ Reports                 │
│ Comments / Reactions    │
└─────────────────────────┘
             ▲
             │ HTTP / JSON
             │ Bearer JWT
┌────────────┴────────────┐
│ Administration Web UI   │
│ React + Vite            │
└─────────────────────────┘

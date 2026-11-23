# ADR-001: Technology Stack

## Status
Accepted

## Decision

Use Java 21 and Maven.

## Reasons

- Native TCP and UDP socket support.
- Strong IntelliJ IDEA integration.
- Maven dependency management.
- JUnit 5 testing support.
- Jackson for JSON serialization.

## Consequences

The application will use the standard Maven directory layout.
Networking will be implemented using Java sockets.

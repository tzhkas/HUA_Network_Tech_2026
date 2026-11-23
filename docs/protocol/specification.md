cat > docs/protocol/specification.md <<'EOF'
# LEGO-DP Protocol Specification

## Protocol Name
LEGO Distribution Protocol (LEGO-DP)

## Version
1.0 (Proposed)

## Purpose
LEGO-DP defines the communication rules between the
server and client applications for distributing LEGO instructions.

## Transport

- UDP: Server discovery.
- TCP: Application communication and image transfer.

## Message Format

JSON headers with binary payloads when required.

## Proposed Message Types

- DISCOVER
- SERVER_FOUND
- CONNECT
- WELCOME
- ASSIGN
- IMAGE_DATA
- IMAGE_ACK
- PROGRESS
- DISCONNECT

## Design Status

This document is a starting point.
Message fields, framing, validation rules, and error handling
must be specified before implementation.
EOF
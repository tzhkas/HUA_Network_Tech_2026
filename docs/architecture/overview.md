cat > docs/architecture/overview.md <<'EOF'
# System Architecture

## Project
LEGO Instruction Distribution Application

## Architecture Style
Client-Server

## Main Components

- Server: Manages connected clients and instruction distribution.
- Client: Receives and displays LEGO instructions.
- Protocol: Defines the communication rules and message formats.
- Network: Handles TCP and UDP communication.
- Distribution: Determines which instructions are assigned to each client.
- PDF: Handles PDF processing and page-to-image conversion.

## Communication

- UDP: Server discovery within the local network.
- TCP: Reliable communication and image transfer.

## Current Design Principles

- Keep the implementation simple.
- Use explicit, deterministic distribution rules.
- Maintain independent progress for each client.
- Transfer complete PDF pages as images.
- Keep page navigation and animation local to each client.

## Status

Initial architecture proposal. Details remain subject to refinement.
EOF
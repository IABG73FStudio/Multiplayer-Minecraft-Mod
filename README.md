# Multiplayer Hub API — starter

## Run locally
1. Install Node.js (LTS).
2. In this folder run `npm install`.
3. Run `npm run dev`.
4. Test `http://localhost:3000/api/v1/health`.
5. Rooms: `http://localhost:3000/api/v1/rooms`.

## Endpoints
- `GET /api/v1/health` — service status
- `GET /api/v1/rooms` — public room list (`q`, `version`, `loader` filters)
- `GET /api/v1/rooms/:id` — public room details
- `POST /api/v1/rooms` — reserved; currently returns 501

Public room data never contains passwords or private host addresses.

This is a development skeleton only: room data is in memory and resets when the server restarts. Before connecting the Minecraft mod or exposing publicly, add authentication, validation, rate limiting, persistent database, host heartbeat, room ownership and security.

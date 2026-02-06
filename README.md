# Jailbreak Store Monolith

The premium marketplace for Roblox Jailbreak items, built with Next.js, Express, and MongoDB.

## 🚀 Features

- **Storefront**: Browse vehicles, skins, and gamepasses with real-time search.
- **Cart System**: Persistent shopping cart with local storage resilience.
- **Authentication**: JWT-based auth with secure HttpOnly cookies.
- **Payments**: Integrated PayOS and Thesieure (Card) gateways.
- **Security**: Hardened with Helmet (CSP), Rate Limiting, and Input Validation.

## 🛠️ Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/vinhgolddev-web/jailbreak-store.git
    cd jailbreak-store
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory (see `.env.example` if available, or ask administrator).

## 🏃‍♂️ Running the App

### Development
```bash
npm run dev
```
Runs the server with `nodemon` for hot-reloading.

### Production
```bash
npm run build
npm start
```
Builds the Next.js app and starts the optimized Express server.

## 🔒 Security & Quality
- **Linting**: `npm run lint` (Zero errors enforced).
- **Hardening**: CSP headers, implementation of rate limits for APIs.
- **Structure**: Monorepo-style structure with `server_api` (Backend) and `app` (Frontend).

## 📄 License
Private Property of Vinh Gold Dev. 

# HISecureStay

A secure property rental platform powered by Solana blockchain.

## Getting Started

### Prerequisites

- Node v18.18.0 or higher
- Rust v1.77.2 or higher
- Anchor CLI 0.30.1 or higher
- Solana CLI 1.18.17 or higher

### Installation

#### Clone the repo

```shell
git clone <repo-url>
cd HISecureStay
```

#### Install Dependencies

```shell
npm install
```

#### Start the web app

```
npm run dev
```

## Components

### Anchor/Blockchain

This is a Solana program written in Rust using the Anchor framework.

#### Commands

```shell
npm run anchor-build        # Build the program
npm run anchor-localnet     # Start test validator with program deployed
npm run anchor-test         # Run the tests
```

#### Deploy to Devnet

```shell
npm run anchor deploy --provider.cluster devnet
```

### Backend

This is an Express.js server that manages the API for the frontend.

```shell
cd backend && npm run dev   # Start backend server
```

### Frontend

This is a Next.js app that provides the user interface.

```shell
npm run dev                 # Start the frontend
npm run build               # Build for production
```

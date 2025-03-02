# HISecureStay Project Guidelines

## Build/Test/Lint Commands
- `npm run dev` - Start Next.js development server
- `npm run build` - Build Next.js application
- `npm run lint` - Run ESLint
- `cd backend && npm run dev` - Start backend server with hot reload
- `cd anchor && anchor build` - Build Solana program
- `cd anchor && anchor test` - Run all Anchor tests
- `cd anchor && npx jest -t "test name"` - Run specific test
- `cd anchor && anchor deploy --provider.cluster devnet` - Deploy to devnet

## Code Style
- Use TypeScript with strict type checking
- Next.js & React for frontend, Express for backend
- Solana/Anchor for blockchain components
- Import paths: `@/*` for src/, `@project/anchor` for anchor/src
- Components use PascalCase, utilities use camelCase
- Prefer async/await over raw Promises
- Use descriptive variable names and comments for complex logic
- Handle errors with try/catch blocks in async functions
- Use React Query for data fetching
- Follow Solana/Anchor best practices for program development

## Environment
- Node v18.18.0+, Rust v1.77.2+
- Anchor CLI 0.30.1+, Solana CLI 1.18.17+
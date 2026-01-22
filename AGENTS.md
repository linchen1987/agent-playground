# Agent Guidelines for AI Playground

## Build Commands
```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
npx tsc --noEmit
```

## Code Style Guidelines

### Type
- Use explicit types for function parameters and return values
- Use `zod` for runtime validation (see project rules)

### Code Styles
- Sort imports alphabetically within groups

#### Naming Conventions
- **Components**: PascalCase (e.g., `ChatComponent`, `ModelCard`)
- **Files**: kebab-case for non-component files (e.g., `api-handler`, `utils`)
- **Variables/Functions**: camelCase (e.g., `handleSubmit`, `isLoading`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_TOKENS`, `API_URL`)
- **Types/Interfaces**: PascalCase with `Type` suffix for complex types

### Error Handling
- Return user-friendly error messages in API responses
- Use zod for input validation with descriptive error messages

### Component Patterns
- Create small, focused components with single responsibilities
- Use composition over inheritance
- Extract reusable logic

### Styling
- Use Tailwind CSS v4 utility classes
- Use CSS variables from `app/globals.css` for theming
- Follow `components.json` alias configuration: `@/components`, `@/lib/utils`, `@/components/ui`
- **UI**: Shadcn UI + Radix UI primitives

### API Routes
- Use REST API endpoints in `app/api/**`
- **Do NOT use server actions** (per project rules)
- Validate requests with zod schemas
- Return consistent JSON response format
- Handle errors with appropriate HTTP status codes

### State Management
- Consider server state with React Query or SWR if needed
- Keep state as close to usage as possible
- Use context sparingly for truly global state

## Testing Guidelines
- No automated frontend UI testing required (manual testing only)
- Do not start virtual browsers for testing
- Focus on logic validation through unit tests if adding tests
- Use React Testing Library if testing components

## Key Dependencies

- **Framework**: Next.js 16 with App Router
- **Icons**: Lucide React
- **Validation**: Zod
- **AI**: @ai-sdk/openai-compatible, ai SDK
- **Package Manager**: pnpm

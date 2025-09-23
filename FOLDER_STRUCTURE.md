# HelpOrbit - Multi-Tenant Ticketing System

## Project Structure Overview

```
helporbit/
├── public/
│   ├── logos/
│   │   ├── helporbit-logo.svg          # Default HelpOrbit logo
│   │   └── default-org-logo.svg        # Fallback org logo
│   └── icons/
│       ├── favicon.ico
│       └── apple-touch-icon.png
│
├── src/
│   ├── app/
│   │   ├── (auth)/                      # Route group for authentication
│   │   │   ├── layout.tsx              # Auth layout wrapper
│   │   │   └── select-organization/
│   │   │       └── page.tsx            # Organization selection screen
│   │   │
│   │   ├── org/
│   │   │   └── [slug]/                 # Dynamic org routes
│   │   │       ├── layout.tsx          # Org-specific layout with branding
│   │   │       ├── login/
│   │   │       │   └── page.tsx        # Branded login screen
│   │   │       ├── forgot-password/
│   │   │       │   └── page.tsx        # Branded forgot password
│   │   │       └── dashboard/
│   │   │           ├── layout.tsx      # Dashboard layout
│   │   │           ├── page.tsx        # Main dashboard
│   │   │           ├── tickets/
│   │   │           │   ├── page.tsx    # Ticket list
│   │   │           │   ├── new/
│   │   │           │   │   └── page.tsx # Create ticket
│   │   │           │   └── [id]/
│   │   │           │       └── page.tsx # Ticket detail
│   │   │           ├── settings/
│   │   │           │   └── page.tsx    # Organization settings
│   │   │           └── users/
│   │   │               └── page.tsx    # User management
│   │   │
│   │   ├── api/                        # API routes (minimal, prefer Server Actions)
│   │   │   └── upload/
│   │   │       └── route.ts            # File upload endpoint
│   │   │
│   │   ├── globals.css                 # Global styles
│   │   ├── layout.tsx                  # Root layout
│   │   ├── page.tsx                    # Home page (redirects to org select)
│   │   ├── favicon.ico
│   │   └── not-found.tsx              # 404 page
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components (already exists)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── form.tsx
│   │   │   └── ...
│   │   │
│   │   ├── auth/
│   │   │   ├── split-auth-layout.tsx   # Split screen layout
│   │   │   ├── organization-finder.tsx  # Org search component
│   │   │   ├── login-form.tsx          # Login form
│   │   │   └── forgot-password-form.tsx # Password reset form
│   │   │
│   │   ├── branding/
│   │   │   ├── theme-provider.tsx      # Dynamic theme context
│   │   │   ├── branded-logo.tsx        # Logo with fallback
│   │   │   └── theme-variables.tsx     # CSS custom properties
│   │   │
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx             # Navigation sidebar
│   │   │   ├── header.tsx              # Dashboard header
│   │   │   ├── ticket-list.tsx         # Ticket list component
│   │   │   ├── ticket-card.tsx         # Individual ticket
│   │   │   ├── create-ticket-form.tsx  # Ticket creation
│   │   │   └── ticket-detail.tsx       # Ticket detail view
│   │   │
│   │   ├── layout/
│   │   │   ├── container.tsx           # Max-width container
│   │   │   └── section.tsx             # Content sections
│   │   │
│   │   └── common/
│   │       ├── loading-spinner.tsx     # Loading states
│   │       ├── error-boundary.tsx      # Error handling
│   │       └── breadcrumb.tsx          # Navigation breadcrumbs
│   │
│   ├── lib/
│   │   ├── utils.ts                    # Utility functions (already exists)
│   │   ├── auth.ts                     # Authentication logic
│   │   ├── db.ts                       # Database connection
│   │   ├── validations.ts              # Zod schemas
│   │   ├── constants.ts                # App constants
│   │   └── server-actions.ts           # Server actions
│   │
│   ├── hooks/
│   │   ├── use-mobile.ts              # Mobile detection (already exists)
│   │   ├── use-organization.ts         # Organization context hook
│   │   ├── use-theme.ts               # Theme management hook
│   │   └── use-tickets.ts             # Ticket data hook
│   │
│   ├── types/
│   │   ├── auth.ts                    # Authentication types
│   │   ├── organization.ts            # Organization types
│   │   ├── ticket.ts                  # Ticket types
│   │   └── user.ts                    # User types
│   │
│   └── styles/
│       └── themes.css                 # Theme-specific CSS variables
│
├── components.json                     # shadcn/ui config
├── tailwind.config.ts                 # Tailwind configuration
├── tsconfig.json                      # TypeScript config
├── next.config.ts                     # Next.js config
└── package.json                       # Dependencies
```

## Key Architecture Decisions

### 1. Route Structure
- `/select-organization` - Landing page for org selection
- `/org/[slug]/login` - Organization-specific login
- `/org/[slug]/dashboard` - Multi-tenant dashboard with nested routes

### 2. Branding System
- `ThemeProvider` for dynamic color schemes
- `BrandedLogo` component with fallbacks
- CSS custom properties for runtime theme switching

### 3. Layout Patterns
- `SplitAuthLayout` for login/forgot-password screens
- Nested layouts for organization branding
- Responsive sidebar for dashboard

### 4. Data Flow
- Server Actions for mutations (login, create tickets, etc.)
- Server Components for data fetching
- Context providers for shared state (theme, organization)

### 5. File Organization
- Route groups `(auth)` for logical grouping
- Component categorization by feature
- Shared utilities and types in `/lib` and `/types`
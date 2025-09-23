# HelpOrbit - Multi-Tenant Ticketing System

A modern, multi-tenant support ticketing platform built with Next.js 15, TypeScript, and Tailwind CSS. HelpOrbit provides organizations with a branded, customizable support portal for managing customer tickets and team collaboration.

## 🚀 Features

### Multi-Tenancy
- **Organization-specific routing** - Each org gets its own branded portal (`/org/acme-corp/`)
- **Dynamic branding** - Custom logos, colors, and themes per organization
- **Isolated data** - Complete separation between organizations

### Authentication & Security
- **Organization-based login** - Users authenticate within their organization context
- **Server Actions** - Secure, server-side form handling without traditional API routes
- **Split-screen auth** - Beautiful login/forgot-password layouts with branding

### Ticket Management
- **Full ticket lifecycle** - Open, In Progress, Waiting for Customer, Resolved, Closed
- **Priority levels** - Low, Medium, High, Urgent with color coding
- **Rich metadata** - Tags, assignees, customer info, timestamps
- **Responsive design** - Works seamlessly on desktop, tablet, and mobile

### Modern Tech Stack
- **Next.js 15** with App Router and Server Components
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **shadcn/ui** component library
- **Server Actions** for mutations
- **Zod** for validation

## 🛠 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Start the development server:**
```bash
npm run dev
```

2. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Organizations

The system includes several demo organizations for testing:

- **acme-corp** - ACME Corporation
- **techstart-inc** - TechStart Inc  
- **global-solutions** - Global Solutions Ltd
- **innovate-labs** - Innovate Labs

### Demo Credentials

For testing the login system:
- **Email**: demo@example.com
- **Password**: password

## 📁 Key Routes

- `/select-organization` - Organization selection screen
- `/org/acme-corp/login` - Organization-specific login  
- `/org/acme-corp/dashboard` - Main dashboard
- `/org/acme-corp/dashboard/tickets` - Ticket management
- `/org/acme-corp/dashboard/tickets/new` - Create new ticket

## 🎨 Features Implemented

✅ **Organization Selection Screen** with search functionality
✅ **Split-screen Authentication Layout** with dynamic branding
✅ **Branded Login & Forgot Password** forms with server actions
✅ **Dynamic Theme System** with CSS custom properties
✅ **Dashboard Layout** with responsive sidebar and header
✅ **Ticket Management** with list, create, and status tracking
✅ **Professional UI Components** using shadcn/ui
✅ **Mobile-Responsive Design** across all screens
✅ **TypeScript** for complete type safety

Built with ❤️ using Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui

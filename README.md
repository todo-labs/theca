# Theca: AI-Powered Personal Library Manager

Theca is a premium book management and reading progress tracking application built with **Next.js 15**, **DrizzleORM**, and **Vercel AI SDK**. It features a stunning, bookshelf-inspired UI and powerful AI integrations.

## Features

- 📚 **Immersive Library Management**: A beautiful, animated bookshelf interface to explore and manage your collection.
- 📖 **Reading Progress Tracking**: Detailed tracking of pages read, reading duration, and current status.
- 🤖 **Unified Recommendations**: A single management hub for both AI-generated and community-submitted book suggestions.
- 📊 **Reading Analytics**: Comprehensive reports and insights into your reading habits and goals.
- 🔐 **Premium Admin Security**: Secure TOTP (Time-based One-Time Password) authentication for the admin panel.
- 🌓 **Dynamic Design**: Multi-theme support with glassmorphism, smooth animations, and a responsive layout.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [DrizzleORM](https://orm.drizzle.team/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Authentication**: TOTP (Time-based One-Time Password)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/) with [OpenRouter](https://openrouter.ai/)
- **Search Engine**: [Exa AI](https://exa.ai/) for smart recommendations
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Runtime**: [Bun](https://bun.sh/)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system
- A PostgreSQL database (e.g., Supabase, Neon, or local)
- A TOTP authenticator app (Google Authenticator, Authy, etc.)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd theca
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/theca
   
   # TOTP Authentication
   TOTP_SECRET=your_generated_secret_here
   
   # AI Configuration
   OPENROUTER_API_KEY=your_openrouter_key
   EXA_API_KEY=your_exa_key
   
   # Feature Flags
   ENABLE_AI_RECOMMENDATIONS=true
   ENABLE_AI_COVER_EXTRACTION=true
   ```

4. **Initialize the database**:
   ```bash
   bun run db:push
   ```

5. **Generate TOTP Secret**:
   ```bash
   bun run generate-totp
   ```

6. **Start the development server**:
   ```bash
   bun run dev
   ```

7. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Admin Panel

The administrative backend is located at `/admin` and provides tools for:

- **Dashboard**: High-level overview of library stats and recent activity.
- **Books**: Detailed CRUD operations for your book collection.
- **Reading Progress**: Log and monitor reading sessions and streaks.
- **Recommendations**: Unified interface to review AI proposals and community suggestions.
- **Reports**: Visualized analytics using Recharts.
- **Settings**: Comprehensive system and AI configuration.

## TOTP Authentication

Theca uses industry-standard TOTP authentication. To set up:

1. Run `bun run generate-totp` to get a QR code.
2. Scan the code with your preferred authenticator app.
3. Save the secret key in your `.env` as `TOTP_SECRET`.
4. Login at `/admin/login` using the 6-digit code.

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run db:push` - Sync schema to database
- `bun run db:studio` - Open Drizzle Studio
- `bun run generate-totp` - Generate new TOTP secret
- `bun run format` - Format code with Prettier
- `bun run lint` - Run ESLint

## License

This project is private and proprietary.
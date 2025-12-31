# Theca: AI-Powered Personal Library Manager

Theca is a book management and reading progress tracking application built with Next.js, DrizzleORM, and Vercel AI SDK.

## Features

- 📚 Book library management
- 📖 Reading progress tracking
- 🤖 AI-powered book recommendations
- 📊 Reading analytics and reports
- 🔐 Secure TOTP authentication for admin access
- 🌓 Dark/Light theme support

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite with DrizzleORM
- **Authentication**: TOTP (Time-based One-Time Password)
- **AI**: Vercel AI SDK with OpenRouter
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Runtime**: Bun

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system
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
   # TOTP Authentication
   TOTP_SECRET=your_totp_secret_here
   
   # AI Configuration (optional)
   OPENROUTER_API_KEY=your_openrouter_key
   
   # Email (optional)
   RESEND_API_KEY=your_resend_key
   ```

4. **Generate TOTP Secret** (see TOTP Authentication Setup below)

5. **Set up the database**:
   ```bash
   bun run db:push
   ```

6. **Start the development server**:
   ```bash
   bun run dev
   ```

7. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## TOTP Authentication Setup

Theca uses TOTP (Time-based One-Time Password) authentication to secure the admin panel.

### Generate a New TOTP Secret

Run the following command to generate a new TOTP secret with a QR code:

```bash
bun run generate-totp
```

This will display:
- 📱 A QR code that you can scan with your authenticator app
- 🔑 The Base32 secret key
- 📝 Instructions for adding it to your `.env` file

### Setup Steps

1. **Generate the secret**:
   ```bash
   bun run generate-totp
   ```

2. **Scan the QR code** with your authenticator app:
   - Google Authenticator
   - Authy
   - Microsoft Authenticator
   - 1Password
   - Any TOTP-compatible app

3. **Add the secret to your `.env` file**:
   ```env
   TOTP_SECRET=YOUR_GENERATED_SECRET_HERE
   ```

4. **Restart your development server** if it's running:
   ```bash
   bun run dev
   ```

### Using TOTP Authentication

1. Navigate to `/admin/login`
2. Enter the 6-digit code from your authenticator app
3. The code refreshes every 30 seconds

### TOTP Configuration Details

- **Issuer**: theca
- **Account**: admin
- **Algorithm**: SHA1
- **Digits**: 6
- **Period**: 30 seconds

### Security Notes

- Keep your TOTP secret secure and never commit it to version control
- The `.env` file is already in `.gitignore`
- Each TOTP code is valid for 30 seconds
- Generate a new secret if you suspect it has been compromised

## Available Scripts

- `bun run dev` - Start the development server
- `bun run build` - Build for production
- `bun run start` - Start the production server
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier
- `bun run generate-totp` - Generate a new TOTP secret with QR code
- `bun run db:generate` - Generate database migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open Drizzle Studio

## Project Structure

```
theca/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── book/             # Book-related components
│   ├── bookshelf/        # Bookshelf components
│   ├── layout/           # Layout components
│   └── ui/               # UI primitives (shadcn/ui)
├── lib/                   # Utility libraries
│   ├── db/               # Database configuration
│   ├── stores/           # Zustand stores
│   └── auth.ts           # Authentication utilities
├── scripts/              # Utility scripts
│   └── generate-totp-secret.ts
└── public/               # Static assets
```

## Admin Panel

The admin panel is accessible at `/admin` and includes:

- **Dashboard** - Overview of library statistics
- **Books** - Manage book collection
- **Library** - Library settings and organization
- **Reading Progress** - Track reading progress
- **User Recommendations** - Manage user recommendations
- **AI Recommendations** - Configure AI-powered recommendations
- **Reports** - View analytics and reports
- **Settings** - System settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.
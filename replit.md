# FlashBrain - Flashcard Study App

## Overview

FlashBrain is a web-based flashcard application designed specifically for students to create, organize, and study flashcards efficiently. The app provides both manual flashcard creation and AI-powered flashcard generation capabilities, wrapped in a modern, mobile-first interface with a clean, paper-like aesthetic.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Context API with custom AppStateProvider
- **UI Components**: Radix UI with Tailwind CSS styling
- **Design System**: shadcn/ui components following "New York" style
- **Mobile-First**: Responsive design optimized for touch interfaces

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: Dual implementation with in-memory storage for development and PostgreSQL for production
- **API**: RESTful endpoints for CRUD operations
- **External Services**: OpenRouter API for AI-powered flashcard generation

### Build System
- **Bundler**: Vite for frontend development and build
- **TypeScript**: Strict type checking across the entire codebase
- **CSS**: PostCSS with Tailwind CSS
- **Development**: Hot module replacement with error overlay

## Key Components

### Data Models
- **Categories**: Top-level organization with customizable colors
- **Folders**: Nested within categories, contain flashcards
- **Flashcards**: Core content with question/answer pairs and visual styling
- **Study Sessions**: Track learning progress and statistics

### User Interface Components
- **Navigation**: Consistent header with breadcrumb navigation
- **Flashcard Display**: Interactive cards with flip animations
- **Study Session**: Full-screen study mode with manual/auto-play options
- **Creation Forms**: Separate flows for manual and AI-generated content

### AI Integration
- **Provider**: OpenRouter API with DeepSeek model
- **Functionality**: Converts text input into structured flashcards
- **Configuration**: Adjustable card limits and content analysis

## Data Flow

### Manual Flashcard Creation
1. User navigates to category → folder → create flashcard
2. Form validation ensures content limits (50 words max)
3. Card style selection (yellow, pink, blue, green, white)
4. Database persistence with immediate UI updates

### AI-Powered Generation
1. User inputs text content via dedicated AI creation page
2. Text is sent to OpenRouter API with formatting instructions
3. AI response is parsed and validated
4. Multiple flashcards are created and stored simultaneously

### Study Sessions
1. User selects folder and initiates study mode
2. Cards are loaded with progress tracking
3. Manual navigation or auto-play with configurable timing
4. Session completion triggers statistics recording

## External Dependencies

### Core Libraries
- **React Ecosystem**: React Query for server state management
- **UI Components**: Extensive Radix UI component library
- **Styling**: Tailwind CSS with custom design tokens
- **Database**: Drizzle ORM with PostgreSQL driver
- **Validation**: Zod for schema validation

### Development Tools
- **Vite**: Development server and build tool
- **TypeScript**: Type safety and development experience
- **ESLint/Prettier**: Code formatting and linting
- **PostCSS**: CSS processing and optimization

### External Services
- **OpenRouter**: AI API for content generation
- **Database**: PostgreSQL (via environment configuration)

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **Error Handling**: Runtime error overlay for debugging
- **Database**: In-memory storage for rapid development

### Production Build
- **Frontend**: Static asset generation via Vite
- **Backend**: ESBuild compilation to single bundle
- **Database**: PostgreSQL with connection pooling
- **Environment**: Configuration via environment variables

### Database Management
- **Migrations**: Drizzle Kit for schema management
- **Seeds**: Programmatic data initialization
- **Backup**: Standard PostgreSQL backup procedures

## Changelog

```
Changelog:
- July 05, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
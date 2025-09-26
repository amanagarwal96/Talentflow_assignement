# TalentFlow - Frontend Hiring Platform

A modern, production-ready frontend hiring platform built with React, TypeScript, and Vite. Features complete job management, candidate tracking, and assessment building capabilities with offline-first architecture using MSW and IndexedDB.

## Live Demo

**Deployed Application**: [https://minihiring-platform.netlify.app/]

## Architecture Overview

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   React App     │◄──►│     MSW      │◄──►│   IndexedDB     │
│                 │    │  (API Layer) │    │  (Persistence)  │
│ • Jobs          │    │              │    │                 │
│ • Candidates    │    │ • Handlers   │    │ • Jobs          │
│ • Assessments   │    │ • Validation │    │ • Candidates    │
│                 │    │ • Error Sim. │    │ • Assessments   │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

### Key Architectural Decisions

**MSW + IndexedDB Choice**: We chose Mock Service Worker (MSW) with IndexedDB persistence to create a realistic API experience while maintaining full frontend control. This approach provides:
- True network simulation with configurable delays (200-1200ms)
- Realistic error scenarios (5-10% failure rate for writes)
- Complete data persistence across browser sessions
- No backend dependencies for development or deployment

**Technology Stack Rationale**:
- **React Query**: Superior caching, optimistic updates, and error handling
- **Dexie**: Robust IndexedDB wrapper with TypeScript support
- **dnd-kit**: Modern, accessible drag-and-drop with touch support
- **react-window**: High-performance virtualization for 1000+ candidate list
- **Tailwind CSS**: Rapid UI development with consistent design system

## Features

### Jobs Management
- **CRUD Operations**: Create, edit, archive/unarchive jobs
- **Drag & Drop Reordering**: Visual job prioritization with optimistic UI
- **Advanced Filtering**: Search by title, filter by status/tags, sort options
- **Server-like Pagination**: Complete pagination with configurable page sizes
- **Slug Validation**: Real-time uniqueness checking with kebab-case formatting
- **Error Handling**: Automatic rollback on reorder failures with undo option

### Candidates Management
- **Virtualized List**: High-performance rendering of 1000+ candidates
- **Real-time Search**: Instant filtering by name/email with debouncing
- **Kanban Board**: Visual stage management with drag-and-drop
- **Timeline Tracking**: Complete candidate journey with automated entries
- **@Mention Support**: Rich text notes with user suggestions
- **Profile Management**: Detailed candidate views with history

### Assessment Builder
- **Visual Builder**: Drag-and-drop section and question management
- **Live Preview**: Real-time form preview with instant updates
- **Question Types**: Text, numeric, single/multi-choice, file upload
- **Conditional Logic**: Show/hide questions based on previous answers
- **Validation Rules**: Required fields, min/max values, character limits
- **Form Runtime**: Complete assessment taking experience

### Technical Features
- **Optimistic UI**: Immediate feedback with automatic rollback on errors
- **Error Simulation**: Configurable failure rates for testing resilience
- **Data Persistence**: All changes saved to IndexedDB automatically
- **Responsive Design**: Mobile-first design with touch-friendly interactions
- **Accessibility**: WCAG compliant with keyboard navigation support

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern browser with IndexedDB support

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/amanagarwal96/Talentflow_assignement/
cd talentflow

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Database Seeding

The application includes comprehensive seed data:

```bash
# Automatic seeding on first run
# Or manually reseed the database:
npm run seed
```

**Seed Data Includes**:
- 25 diverse job postings (active/archived mix)
- 1000 candidates across all stages
- 3 complete assessment forms with conditional logic
- 10 HR users for @mention functionality
- Realistic timeline entries and stage transitions

## MSW Configuration & Error Simulation

### Network Simulation
- **Response Delays**: Random 200-1200ms per request
- **Write Error Rate**: 5-10% for POST/PUT/PATCH operations
- **Reorder Error Rate**: 10% specifically for drag-and-drop testing

### Error Testing
Access the browser console and modify error rates:
```javascript
// Increase error rate for testing rollbacks
window.__MSW_ERROR_RATE__ = 0.5; // 50% failure rate
```

### Development Controls
- **Reseed Database**: Use the sidebar "Reseed Database" button
- **MSW DevTools**: Available in browser developer tools
- **React Query DevTools**: Included for cache inspection

## Testing

### E2E Tests with Playwright

```bash
# Install Playwright browsers
npx playwright install

# Run all tests
npm run test:e2e

# Run tests in UI mode
npx playwright test --ui
```

**Test Coverage**:
- Job creation with slug uniqueness validation
- Drag-and-drop reordering with error simulation
- Candidate kanban stage transitions
- Assessment builder and form submission
- Virtualized list performance

### Manual Testing Scenarios

1. **Optimistic UI Testing**: Drag jobs to reorder, observe immediate feedback
2. **Error Recovery**: Trigger MSW errors, verify rollback behavior
3. **Data Persistence**: Refresh browser, confirm all changes persisted
4. **Assessment Logic**: Create conditional questions, test runtime behavior

## Deployment

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Or connect GitHub repo for automatic deployments
```

### Deploy to Netlify

```bash
# Build command: npm run build
# Publish directory: dist
# Environment variables: None required
```

**Deployment Notes**:
- No environment variables required (frontend-only)
- All data persists in browser IndexedDB
- MSW runs in browser, no server configuration needed

## Data Management

### IndexedDB Schema

```typescript
// Core tables with relationships
jobs: id, title, slug, status, tags, order, createdAt, updatedAt
candidates: id, name, email, jobId, stage, createdAt  
timelines: id, candidateId, timestamp, fromStage, toStage, notes
assessments: jobId (pk), sections, updatedAt
responses: id, jobId, candidateId, submittedAt, answers
users: id, name, email (for @mentions)
```

### Data Export/Import

```javascript
// Export all data (browser console)
await db.export();

// Import data
await db.import(dataObject);
```

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run seed         # Reseed database
npm run test:e2e     # Run E2E tests
```

## Known Issues & Limitations

### Current Limitations
- **File Upload**: Metadata only (no actual file storage)
- **Real-time Updates**: Single browser instance only
- **Export Features**: Basic JSON export (CSV export partially implemented)
- **Authentication**: Demo mode only (no real auth required)

### Browser Support
- **Minimum**: Chrome 88+, Firefox 78+, Safari 14+
- **Required**: IndexedDB support, ES2020 features
- **Optimal**: Latest Chrome/Firefox for full MSW support

## Future Improvements

### Planned Features
- Real-time collaboration with WebSocket simulation
- Advanced analytics dashboard with charts
- Bulk operations (archive multiple jobs, batch candidate updates)
- Email template builder for candidate communication
- Interview scheduling integration
- Resume parsing and skill extraction
- Advanced search with filters and saved searches

### Technical Debt
- Increase test coverage to >90%
- Add comprehensive error boundaries
- Implement proper loading states for all operations
- Add data migration system for schema changes
- Optimize bundle size with code splitting

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow existing TypeScript patterns
- Add tests for new features
- Update documentation for API changes
- Ensure accessibility compliance

---

**Built for production-ready frontend hiring platform showcasing modern React architecture**

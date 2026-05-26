# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git configured

## Initial Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd group-travel-planner
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 👥 Team Member Guides

### Person A (Frontend Developer) - YOU ARE HERE ✅
**Status**: ✅ Complete - Ready for API integration

**Your branch**: `feature/frontend-dashboard`

**What's done**:
- ✅ All 6 components built and styled
- ✅ Responsive layout with Tailwind CSS
- ✅ Mock data structure defined
- ✅ Design system implemented

**Next steps**:
1. Test all components in browser
2. Make any final styling adjustments
3. Open PR to `dev` branch
4. Tag Person C with "Ready for API integration"

### Person B (Database Developer)
**Your branch**: `feature/database-schema`

**Your tasks**:
1. Review `src/mockData/index.js` for data shapes
2. Create `database/schema.sql` with matching tables
3. Create `database/rls_policies.sql` for security
4. Create `database/seed.sql` with sample data
5. Tag Person C when schema is ready

### Person C (API Services Developer)
**Your branch**: `feature/api-services`

**Your tasks**:
1. Wait for Person B's schema
2. Create Supabase client in `src/lib/supabaseClient.js`
3. Create service functions matching mock data exports
4. Update `src/App.jsx` to use your services
5. Add loading states and error handling
6. Test with Person A's components

## 🔄 Workflow

```
Person B (Schema) → Person C (Services) → Person A (Integration)
```

1. Person B finalizes database schema
2. Person C builds API services
3. Person A integrates services into components
4. All merge to `dev` branch
5. Test integration
6. Merge `dev` to `main`

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🎨 Design Tokens

- Background: `#F9F8F4`
- Primary: `#2E3F5C`
- Accent: `#E8A87C`
- Font: DM Sans

## 📁 Key Files

- `src/App.jsx` - Main app component
- `src/mockData/index.js` - Mock data (to be replaced)
- `src/components/` - All UI components
- `src/lib/` - API services (Person C)
- `database/` - Schema files (Person B)

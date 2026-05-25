# 🏗️ Frontend Architecture

## Component Hierarchy

```
App.jsx
├── Sidebar
│   ├── Logo (Plane icon + "Wandr")
│   ├── Navigation Items
│   │   ├── Dashboard (active)
│   │   ├── Itinerary
│   │   ├── Expenses
│   │   └── Docs
│   └── User Profile Section
│
└── Main Content Area
    ├── Header
    │   ├── Trip Info (name + date badge)
    │   ├── Search Bar
    │   └── User Menu (notifications + dropdown)
    │
    └── Dashboard Grid (3-column layout)
        ├── Left Column (2/3 width)
        │   └── ItineraryTimeline
        │       └── Activity Cards (grouped by date)
        │
        └── Right Column (1/3 width)
            ├── BudgetPieChart
            │   ├── Donut Chart (Recharts)
            │   └── Category Legend
            │
            ├── RecentExpenses
            │   └── Scrollable List
            │
            └── BalanceSheet
                ├── Balance Rows
                └── "SETTLE UP" Button
```

## Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│  SIDEBAR (fixed)          MAIN CONTENT AREA                   │
│  ┌──────────┐  ┌──────────────────────────────────────────┐  │
│  │          │  │  HEADER                                   │  │
│  │  Logo    │  │  Trip Name | Search | User Menu          │  │
│  │          │  └──────────────────────────────────────────┘  │
│  │  Nav     │  ┌─────────────────────┬──────────────────┐   │
│  │  Items   │  │                     │                  │   │
│  │          │  │  ITINERARY          │  BUDGET CHART    │   │
│  │  • Dash  │  │  TIMELINE           │                  │   │
│  │  • Itin  │  │                     ├──────────────────┤   │
│  │  • Exp   │  │  (Activity Cards)   │  RECENT          │   │
│  │  • Docs  │  │                     │  EXPENSES        │   │
│  │          │  │                     ├──────────────────┤   │
│  │  User    │  │                     │  BALANCE         │   │
│  │  Profile │  │                     │  SHEET           │   │
│  └──────────┘  └─────────────────────┴──────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

```
Mock Data (src/mockData/index.js)
    ↓
App.jsx (imports and passes as props)
    ↓
Components (render based on props)
```

### Future State (After Person C Integration)

```
Supabase Database
    ↓
API Services (src/lib/)
    ↓
App.jsx (async data fetching)
    ↓
Components (render with loading/error states)
```

## Responsive Behavior

### Desktop (≥ 1024px)
- Sidebar: Fixed left, 256px width
- Main: 3-column grid (2:1 ratio)
- All components visible

### Tablet (768px - 1023px)
- Sidebar: Fixed left, 256px width
- Main: Single column stack
- Components full width

### Mobile (< 768px)
- Sidebar: Hidden (could add bottom nav)
- Main: Single column stack
- Components full width
- Search bar hidden in header

## State Management

### Current (Mock Data)
- No state management needed
- Props passed down from App.jsx
- All data is static

### Future (Live Data)
- useState for data storage
- useEffect for data fetching
- Loading states per component
- Error boundaries for failures

## Styling Architecture

### Tailwind Configuration
- Custom colors in `tailwind.config.js`
- Design tokens: warm-bg, primary, accent
- Extended color palette for charts

### Component Styling Pattern
```javascript
// Card wrapper
className="bg-white rounded-2xl shadow-sm p-6"

// Interactive elements
className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"

// Typography
className="text-xl font-bold text-primary"
```

## File Organization

```
src/
├── components/          # All UI components
│   ├── Sidebar.jsx
│   ├── Header.jsx
│   ├── ItineraryTimeline.jsx
│   ├── BudgetPieChart.jsx
│   ├── RecentExpenses.jsx
│   ├── BalanceSheet.jsx
│   └── index.js        # Component exports
│
├── mockData/           # Mock data (temporary)
│   └── index.js
│
├── lib/                # API services (Person C)
│   └── README.md
│
├── App.jsx             # Root component
├── main.jsx            # React entry point
└── index.css           # Global styles
```

## Dependencies

### Production
- `react` - UI library
- `react-dom` - React renderer
- `recharts` - Chart library
- `lucide-react` - Icon library

### Development
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `@vitejs/plugin-react` - React support

## Performance Considerations

- All components are functional (no class components)
- Minimal re-renders (props-based rendering)
- Lazy loading ready (can add React.lazy later)
- Optimized Tailwind (purges unused CSS in production)

## Accessibility

- Semantic HTML elements
- Proper heading hierarchy
- Interactive elements have hover states
- Color contrast meets WCAG AA standards
- Keyboard navigation ready (can enhance)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features used
- CSS Grid and Flexbox
- No IE11 support needed

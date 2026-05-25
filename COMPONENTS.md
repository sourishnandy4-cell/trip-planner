# 📦 Component Documentation

## Component Overview

All components are built with React and Tailwind CSS, following the design system specified in the project requirements.

---

## `<Sidebar />`
**Location**: `src/components/Sidebar.jsx`

### Props
```javascript
{
  activeTab: string,      // Current active tab ('dashboard', 'itinerary', 'expenses', 'docs')
  onTabChange: function   // Callback when tab is clicked
}
```

### Features
- Fixed left sidebar (hidden on mobile)
- Logo with plane icon
- Navigation items with hover states
- Active state highlighting
- User profile section at bottom

---

## `<Header />`
**Location**: `src/components/Header.jsx`

### Props
```javascript
{
  tripName: string,       // e.g., "Barcelona Group Trip"
  dateRange: string,      // e.g., "July 12–19"
  user: {
    name: string,         // e.g., "Sarah J."
    initials: string      // e.g., "SJ"
  }
}
```

### Features
- Trip title and date badge
- Search bar (center)
- Notification bell with badge
- User dropdown menu

---

## `<ItineraryTimeline />`
**Location**: `src/components/ItineraryTimeline.jsx`

### Props
```javascript
{
  items: Array<{
    id: string,
    start_time: string,     // ISO 8601 format
    title: string,
    location: string,
    notes: string,
    category_icon: string   // 'transport', 'food', 'activity', 'music'
  }>
}
```

### Features
- Vertical timeline with date grouping
- Activity cards with icons
- Hover lift effect
- Responsive layout

---

## `<BudgetPieChart />`
**Location**: `src/components/BudgetPieChart.jsx`

### Props
```javascript
{
  totalBudget: number,
  categories: Array<{
    id: string,
    category: string,
    amount: number
  }>
}
```

### Features
- Donut chart with Recharts
- Center label showing total
- Color-coded legend
- Responsive sizing

### Color Mapping
- Accommodation: `#2E3F5C`
- Food & Drinks: `#E8A87C`
- Activities: `#6DB8A8`
- Transport: `#C4B5D0`

---

## `<RecentExpenses />`
**Location**: `src/components/RecentExpenses.jsx`

### Props
```javascript
{
  expenses: Array<{
    id: string,
    description: string,
    amount: number,
    paid_by: string
  }>
}
```

### Features
- Scrollable list (max 300px)
- Alternating row backgrounds
- "Paid by" badges
- Hover states

---

## `<BalanceSheet />`
**Location**: `src/components/BalanceSheet.jsx`

### Props
```javascript
{
  balances: Array<{
    from: string,
    to: string,
    amount: number
  }>
}
```

### Features
- Who-owes-whom display
- Arrow indicators
- Prominent "SETTLE UP" button
- Empty state message

---

## Design System

### Colors
- `warm-bg`: #F9F8F4
- `primary`: #2E3F5C
- `accent`: #E8A87C
- `activity-green`: #6DB8A8
- `transport-purple`: #C4B5D0

### Typography
- Font: DM Sans
- Headings: Bold, primary color
- Body: Regular, gray-700

### Spacing
- Card padding: `p-6`
- Card radius: `rounded-2xl`
- Gap between elements: `gap-4` or `gap-6`

### Transitions
All interactive elements use: `transition-all duration-200`

---

## Integration Notes for Person C

All components accept props and render accordingly. No internal state management for data.

To integrate:
1. Replace mock data imports in `src/App.jsx`
2. Add loading states with skeleton screens
3. Add error boundaries
4. Implement data refetching logic

# Quick Integration Guide for New Theme

## How to Update Existing Pages

### 1. Replace Old Button Styles

**Before:**
```jsx
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click Me
</button>
```

**After:**
```jsx
<button className="btn-primary">
  Click Me ✨
</button>

// Or use the component:
import { PrimaryButton } from '../components/EnhancedButton';
<PrimaryButton loading={isLoading}>Click Me ✨</PrimaryButton>
```

### 2. Update Card Styling

**Before:**
```jsx
<div className="bg-white p-4 rounded shadow">
  Content
</div>
```

**After:**
```jsx
<div className="card hover-lift animate-slide-up">
  Content
</div>

// Or for special effects:
<div className="card-glass">Content</div>
<div className="card-gradient">Content</div>
```

### 3. Add Page Animations

Wrap your page content:
```jsx
<div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 animate-fade-in">
  <div className="animate-slide-up">
    {/* Your content */}
  </div>
</div>
```

### 4. Update Form Inputs

**Before:**
```jsx
<input className="w-full px-3 py-2 border rounded" />
```

**After:**
```jsx
<input className="input-field" placeholder="Enter value..." />
```

### 5. Add Status Badges

```jsx
import { StatusBadge } from '../components/Badge';

// Automatic coloring based on status
<StatusBadge status="active" />
<StatusBadge status="pending" />
<StatusBadge status="expired" />

// Or custom badges
<Badge variant="success">New!</Badge>
<Badge variant="warning">Beta</Badge>
```

### 6. Add Loading States

```jsx
import { LoadingSpinner } from '../components/LoadingSpinner';

// Small spinner
{loading && <LoadingSpinner size="sm" />}

// Full screen
{loading && <LoadingSpinner size="lg" fullScreen />}

// Skeleton loading
{loading && <SkeletonCard />}
```

### 7. Update Headings with Gradients

```jsx
<h1 className="text-4xl font-bold text-gradient-hero">
  Amazing Title
</h1>

<h2 className="text-2xl font-bold text-gradient">
  Subtitle
</h2>
```

### 8. Add Hover Effects

```jsx
// Lift on hover
<div className="card hover-lift">...</div>

// Glow on hover
<button className="btn-primary hover-glow">...</button>

// Custom hover
<div className="transition-all hover:scale-105 hover:shadow-xl">
  ...
</div>
```

### 9. Create Stat Cards

```jsx
import { StatCard } from '../components/Card';

<div className="grid md:grid-cols-3 gap-6">
  <StatCard 
    icon="💰"
    title="Total Earnings"
    value="₹12,450"
    trend={15.5}
    gradient="from-green-500 to-emerald-600"
  />
  <StatCard 
    icon="📦"
    title="Products"
    value="245"
    trend={-5.2}
    gradient="from-blue-500 to-cyan-600"
  />
</div>
```

### 10. Add Animated Backgrounds

```jsx
<div className="relative">
  {/* Animated blob */}
  <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-brand-300 to-accent-300 rounded-full blur-3xl opacity-20 animate-float"></div>
  
  {/* Content */}
  <div className="relative z-10">
    Your content here
  </div>
</div>
```

## Quick Checklist for Each Page

- [ ] Add page-level animation (`animate-fade-in`)
- [ ] Update all buttons to use new classes
- [ ] Replace div cards with `.card` class
- [ ] Add hover effects to interactive elements
- [ ] Use `input-field` for all inputs
- [ ] Add status badges where applicable
- [ ] Use gradient text for main headings
- [ ] Add loading spinners during API calls
- [ ] Ensure mobile responsiveness
- [ ] Add emoji icons for better UX

## Common Patterns

### Dashboard Header
```jsx
<div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-3xl font-bold text-gradient-hero">Dashboard</h1>
    <p className="text-gray-600 mt-2">Welcome back! 👋</p>
  </div>
  <button className="btn-primary">
    <span>New Item</span>
    <span>+</span>
  </button>
</div>
```

### Grid Layout
```jsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="card hover-lift">
      {/* Card content */}
    </div>
  ))}
</div>
```

### Loading State
```jsx
{loading ? (
  <LoadingSpinner fullScreen />
) : (
  <div className="animate-fade-in">
    {/* Content */}
  </div>
)}
```

### Alert Messages
```jsx
{error && (
  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl animate-slide-down flex items-center gap-2">
    <span>❌</span>
    <span>{error}</span>
  </div>
)}

{success && (
  <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl animate-slide-down flex items-center gap-2">
    <span>✅</span>
    <span>{success}</span>
  </div>
)}
```

### Action Bar
```jsx
<div className="flex flex-wrap gap-3">
  <button className="btn-primary">Save</button>
  <button className="btn-secondary">Cancel</button>
  <button className="btn-danger">Delete</button>
</div>
```

### Table Enhancement
```jsx
<div className="card overflow-hidden">
  <table className="w-full">
    <thead className="bg-gradient-to-r from-brand-50 to-accent-50">
      <tr>
        <th className="px-4 py-3 text-left font-bold">Column</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b hover:bg-brand-50 transition">
        <td className="px-4 py-3">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Performance Tips

1. Use CSS transforms instead of position changes
2. Limit simultaneous animations
3. Use `will-change` sparingly
4. Debounce hover effects on lists
5. Lazy load heavy components
6. Use skeleton screens for better perceived performance

## Mobile Considerations

```jsx
// Show different layouts on mobile
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  
// Stack elements vertically on mobile
<div className="flex flex-col md:flex-row gap-4">

// Hide on mobile
<div className="hidden md:block">

// Show only on mobile  
<div className="block md:hidden">
```

---

**Ready to make your pages beautiful! 🎨**

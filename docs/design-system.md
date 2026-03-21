# Design System: Chromic Glass

## Philosophy

The Campaign Generator design system is built around the concept of **"chromic glass for serious operators"** - a visual language that combines premium aesthetics with functional clarity.

### Core Principles

1. **Lead with clarity, not spectacle**
2. **Every element has a purpose**
3. **AI should assist, not obscure**
4. **Trust beats novelty**
5. **Workflow, not demo**

### Mood

- Lucid
- Luminous
- Polished
- Precise
- Editorial
- Confident
- Weightless
- Intelligent
- Premium
- Calm

## Color System

### Neutrals

```css
--color-obsidian-950: #090B10   /* Deep app background */
--color-graphite-900: #121722   /* Shell background */
--color-slate-glass-800: rgba(28, 35, 49, 0.72)  /* Panel base */
--color-pearl-100: #F3F7FF      /* Main light text */
--color-mist-300: #A8B5CC       /* Muted borders/highlights */
--color-fog-400: #8A96AC        /* Secondary text */
```

### Primary Chromic Accents

```css
--color-violet-500: #7A6CFF     /* Spectrum Violet */
--color-cyan-500: #3CCBFF       /* Aurora Cyan */
--color-teal-500: #29C6B7       /* Signal Teal */
```

### Warm Premium Accent

```css
--color-amber-400: #FFBC6A      /* Ion Amber */
```

### Semantic Colors

```css
--color-success-500: #34D3A2
--color-warning-500: #F0B34C
--color-danger-500: #FF6B7A
```

### Usage Guidelines

**Background Hierarchy**:
- Level 0 (Canvas): `obsidian-950`
- Level 1 (Shell): `graphite-900`
- Level 2 (Panels): `slate-glass-800`
- Level 3 (Elevated): Panels with higher opacity
- Level 4 (Active): Accent color overlays

**Text Hierarchy**:
- Primary: `pearl-100`
- Secondary: `mist-300`
- Tertiary: `fog-400`

**Accent Usage**:
- Primary actions: `violet-500`
- Secondary actions: `teal-500`
- Highlights: `cyan-500`
- Premium features: `amber-400`

## Typography

### Font Family

**Primary UI Font**: Geist Sans
- Clean, modern sans-serif
- Excellent readability
- Variable font for flexibility

**Display Accent** (Optional): Refined serif for hero moments only

### Type Scale

```css
/* Display */
--text-display-xl: 60px / 1.1
--text-display-lg: 48px / 1.1
--text-display-md: 36px / 1.2

/* Headings */
--text-h1: 32px / 1.2
--text-h2: 24px / 1.3
--text-h3: 20px / 1.3
--text-h4: 18px / 1.4

/* Body */
--text-body-lg: 18px / 1.5
--text-body-md: 16px / 1.5
--text-body-sm: 14px / 1.5

/* Labels */
--text-label-lg: 14px / 1.4
--text-label-md: 13px / 1.4
--text-label-sm: 12px / 1.4

/* Caption */
--text-caption: 12px / 1.3
```

### Font Weights

- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

### Usage Guidelines

**Headings**:
- Use semibold (600) for most headings
- Use bold (700) sparingly for emphasis
- Tighter line-height for display text (1.1-1.2)

**Body Text**:
- Use regular (400) for body copy
- Use medium (500) for labels and UI text
- Comfortable line-height (1.4-1.6)

**Buttons**:
- Use medium (500) weight
- No all-caps by default
- Concise verb labels

## Surface System

### Glass Panel

The signature "glass panel" effect:

```css
.glass-panel {
  background: var(--color-slate-glass-800);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--color-stroke-subtle);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.glass-panel:hover {
  border-color: var(--color-stroke-strong);
}
```

### Chromic Background

Subtle gradient background for canvas:

```css
.chromic-bg {
  background: 
    radial-gradient(circle at 20% 50%, rgba(122, 108, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(60, 203, 255, 0.1) 0%, transparent 50%),
    var(--color-obsidian-950);
}
```

### Border Radius

```css
--radius-xl: 24px   /* App shell sections */
--radius-lg: 20px   /* Cards/panels */
--radius-md: 16px   /* Controls */
--radius-sm: 12px   /* Small nested items */
--radius-pill: 999px /* Pill controls */
```

### Shadows

```css
/* Panel shadow */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

/* Modal shadow */
box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4);

/* Subtle shadow */
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
```

## Spacing System

### Scale

```css
--spacing-xs: 0.25rem   /* 4px */
--spacing-sm: 0.5rem    /* 8px */
--spacing-md: 1rem      /* 16px */
--spacing-lg: 1.5rem    /* 24px */
--spacing-xl: 2rem      /* 32px */
--spacing-2xl: 3rem     /* 48px */
--spacing-3xl: 4rem     /* 64px */
```

### Usage Guidelines

**Component Padding**:
- Small components: `sm` to `md`
- Medium components: `md` to `lg`
- Large panels: `lg` to `xl`

**Component Gaps**:
- Tight grouping: `xs` to `sm`
- Related items: `sm` to `md`
- Sections: `lg` to `xl`

## Components

### Button

**Variants**:
- `primary`: Solid violet background
- `secondary`: Glass panel with border
- `ghost`: Transparent with hover state
- `destructive`: Danger color

**Sizes**:
- `sm`: Height 36px, padding 12px
- `md`: Height 40px, padding 16px
- `lg`: Height 44px, padding 32px

**States**:
- Default
- Hover (lighter/brighter)
- Active (pressed)
- Disabled (50% opacity)
- Loading (spinner)

### Input

**Base Style**:
- Glass panel background
- Subtle border
- Focus ring in violet
- Placeholder in mist-300

**States**:
- Default
- Focus (violet ring)
- Error (danger border)
- Disabled (reduced opacity)

### Card

**Base Style**:
- Glass panel
- Rounded corners (lg)
- Optional header/footer
- Hover state (brighter border)

### Badge

**Confidence Levels**:
- High: Green background, success color
- Medium: Amber background, warning color
- Low: Red background, danger color

### Stepper

**Visual Design**:
- Numbered circles
- Connecting lines
- Check marks for completed steps
- Active step highlighted in violet

## Motion & Animation

### Principles

- **Purposeful**: Every animation serves a function
- **Restrained**: Subtle, not distracting
- **Fast**: 200-300ms for most transitions
- **Natural**: Ease-out curves

### Timing Functions

```css
/* Default */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Ease out (entering) */
transition-timing-function: cubic-bezier(0, 0, 0.2, 1);

/* Ease in (exiting) */
transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
```

### Duration

- Micro-interactions: 150ms
- Standard transitions: 200ms
- Complex animations: 300ms
- Page transitions: 400ms

### Usage Guidelines

**Hover States**:
```css
transition: all 200ms ease-out;
```

**Modal Entry**:
```css
animation: fadeIn 300ms ease-out;
```

**Loading Spinners**:
```css
animation: spin 1s linear infinite;
```

## Iconography

### Style

- **Library**: Lucide React
- **Weight**: 2px stroke
- **Style**: Outline only
- **Size**: 16px, 20px, 24px

### Usage

```tsx
import { Icon } from 'lucide-react'

<Icon className="w-5 h-5 text-mist-300" />
```

## Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

### Approach

- **Desktop-first** for app UI
- **Mobile-friendly** but not mobile-first
- **Encourage desktop** for complex workflows

## Accessibility

### Contrast

- All text meets WCAG AA standards
- Interactive elements have clear focus states
- Glass effects maintain readability

### Focus States

```css
*:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}
```

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Logical tab order
- Skip links where appropriate

### Screen Readers

- Semantic HTML
- ARIA labels where needed
- Alt text for images

## Dark Mode

### Strategy

- **Dark mode first**: Optimized for dark surfaces
- **Light mode support**: Available but secondary
- **System preference**: Respects user's OS setting

### Implementation

```css
:root {
  /* Dark mode (default) */
}

.light {
  /* Light mode overrides */
}
```

## Best Practices

### Do's

✓ Use glass panels for elevated surfaces
✓ Maintain consistent spacing
✓ Use semantic color tokens
✓ Keep animations subtle
✓ Ensure sufficient contrast
✓ Use proper heading hierarchy

### Don'ts

✗ Don't overuse glow effects
✗ Don't stack too many blur layers
✗ Don't use random spacing values
✗ Don't mix icon styles
✗ Don't use all-caps everywhere
✗ Don't sacrifice readability for aesthetics

## Component Examples

### Glass Panel

```tsx
<div className="glass-panel rounded-lg p-6">
  <h2 className="text-xl font-semibold mb-4">Title</h2>
  <p className="text-mist-300">Content</p>
</div>
```

### Primary Button

```tsx
<Button variant="primary" size="lg">
  <Icon className="w-5 h-5" />
  Action
</Button>
```

### Confidence Badge

```tsx
<ConfidenceBadge level="high" />
```

### Stepper

```tsx
<Stepper 
  steps={steps} 
  currentStep={2} 
  onStepClick={handleStepClick}
/>
```

## Future Enhancements

- Additional component variants
- More sophisticated animations
- Enhanced accessibility features
- Extended color palette for data visualization
- Component composition patterns

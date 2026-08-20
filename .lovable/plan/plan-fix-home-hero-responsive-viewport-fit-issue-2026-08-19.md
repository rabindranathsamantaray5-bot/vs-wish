# Plan: Fix Home Hero Responsive / Viewport Fit Issue

Improve the Home page Hero layout to ensure the complete composition fits within the initial viewport on various laptop and mobile screens, while strictly preserving the existing design, animations, and functionality.

## Proposed Changes

### 1. Unified Sizing Strategy
- Replace hardcoded `sticky top-0 h-screen` and `h-[240vh]` logic with more flexible viewport-aware sizing.
- Use `clamp()` for responsive typography and element sizing to prevent clipping.
- Implement `min-height` constraints to ensure content never overflows the viewport on short screens.

### 2. Vertical Space Optimization
- Adjust vertical spacing (`gap`, `mt`, `mb`, `pt`) using responsive units (e.g., `vh`, `clamp`) to tighten the layout on shorter viewports.
- Scale the "Gift" centerpiece and "Digital Wishes" headline proportionally based on viewport dimensions.
- Ensure the "Scroll to unwrap" indicator and social proof section remain visible above the fold.

### 3. Headline & Script Text Fix
- Apply horizontal padding and overflow protection to the "Digital" and "Wishes" script spans.
- Use `clamp()` for the "Create Beautiful" headline font size.
- Ensure the gift centerpiece is properly centered and scaled between the script words.

### 4. Decorative Element Refinement
- Adjust positioning of background blobs, balloons, and stickers to ensure they stay within viewport bounds and don't cause horizontal overflow.
- Scale decorative 3D stickers based on screen size.

### 5. Verified Viewports
- Test and verify across:
  - Laptops: 1366x768, 1440x900, 1536x864, 1280x720
  - Tablets: 1024x768, 768x1024
  - Mobile: 430x932, 390x844, 375x812, 360x800

## Technical Details

- **File**: `src/routes/index.jsx`
- **Method**: 
  - Update Tailwind classes to use `clamp()` and viewport units (`vh`, `dvh`).
  - Refine `framer-motion` scroll transforms to better handle short viewports.
  - Optimize `Hero` component container padding and alignment.
- **Constraints**: 
  - NO removal of existing elements.
  - NO redesign of the current visual style.
  - NO changes to the global header or theme toggle.
  - NO horizontal scrolling.

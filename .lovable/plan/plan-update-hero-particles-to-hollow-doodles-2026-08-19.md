# Plan: Update Hero Particles to Hollow Doodles

Update the falling particles in the Home page Hero section to use hollow/outline hearts, stars, and sparkles instead of filled shapes.

## Proposed Changes

### 1. Update Particle Data Generation
- Modify the `confetti` array generation logic in `src/routes/index.jsx`.
- Replace the simple `shape` (0 or 1) with a `type` that maps to hollow heart (`♡`), hollow star (`☆`), or outline sparkle (`✧`).
- Add a `color` property that randomly selects from the requested palette: pastel pink, coral, purple, lavender, yellow/gold, soft blue, mint/green, peach/orange.
- Ensure varying sizes and rotations are included in the data.

### 2. Replace Particle Rendering
- Update the rendering loop in `src/routes/index.jsx`.
- Instead of using a styled `span` with a background color and border radius, use a `motion.div` that renders the specific hollow character or an SVG path.
- Apply the color to the `text` or `stroke` property.
- Remove all `background` and `borderRadius` styles that create filled squares/circles.
- Ensure the center remains transparent.
- Maintain the current smooth falling and rotating animations.

### 3. Responsive Adjustments
- Adjust the number of particles based on screen width (desktop: ~30, tablet: ~20, mobile: ~12).
- Scale the particle sizes appropriately for mobile viewports.

## Technical Details

### Colors
- Pastel Pink: `#FFB7C5`
- Coral: `#FF7F50`
- Purple: `#A855F7`
- Lavender: `#E9D5FF`
- Yellow/Gold: `#FBBF24`
- Soft Blue: `#60A5FA`
- Mint/Green: `#34D399`
- Peach/Orange: `#FB923C`

### Shapes
- Hollow Heart: `♡` or custom SVG outline
- Hollow Star: `☆` or custom SVG outline
- Outline Sparkle: `✧` or custom SVG outline

## Verification Plan

### Manual Verification
- Use `browser-use` to capture screenshots at:
  - 1920x1080 (Desktop)
  - 1280x720 (Laptop)
  - 390x844 (Mobile)
- Confirm:
  - NO filled hearts/stars.
  - NO squares/diamonds.
  - Particles are hollow outlines.
  - Centers are transparent.
  - Colors match the requested palette.
  - Animation is smooth and doesn't interfere with text.

### Build Check
- Run `bun run build` to ensure no regressions.

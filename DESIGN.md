# Design System: Generated Screen (CryptoDash)
**Project ID:** 2449142607525480099

## 1. Visual Theme & Atmosphere
A deep, futuristic, and premium dashboard aesthetic designed for power users (like crypto traders or developers). It relies heavily on a "dark mode" philosophy paired with glassmorphism (translucent panels with background blur). The mood is sleek, highly technical, dense with data, but organized and easily scannable thanks to high-contrast neon accents against very dark navy backgrounds.

## 2. Color Palette & Roles
* **Pitch Black Deep Navy** (`#050c14`): The foundational background color. Used for the main body/canvas and sidebar. It creates a feeling of endless depth.
* **Elevated Card Navy** (`#0d1624`): A slightly lighter, muted blue-gray-black used for cards, panels, and distinct content sections.
* **Neon Cyber Teal** (`#00f2ff`): The primary action and highlight color. Used for glowing borders, critical buttons, active navigation states, progress bars, and key typography highlights.
* **Glass White** (`rgba(255, 255, 255, 0.05)`): A barely-there white used for hover states on list items and subtle pill backgrounds.
* **Glass Border** (`rgba(255, 255, 255, 0.1)`): A faint white stroke used to define the edges of glassmorphic cards and headers without creating harsh lines.
* **Secondary Accents**: Indigo (`#6366f1`) for secondary tokens/assets, and Emerald (`#34d399`) for live pulse/status indicators.

## 3. Typography Rules
* **Primary UI Font:** `Inter` (sans-serif). Used for all labeling, navigation, headers, and standard text. It provides excellent legibility in dark modes.
* **Data & Code Font:** `JetBrains Mono` (monospace). Used specifically for metric values, points balances, wallet contents, cryptocurrency amounts, and actual code blocks.
* **Character:** Headers are often uppercase with wide tracking (letter-spacing) to feel premium and technical (e.g., `tracking-widest`).

## 4. Component Stylings
* **Glass Cards:** Generously rounded corners (`1.5rem` or `24px`), dark translucent backgrounds (`rgba(13, 22, 36, 0.7)`), strong background blurs (`12px`), and subtle glass borders (`rgba(255, 255, 255, 0.08)`).
* **Glowing Elements:** Key active elements (like the active nav item or primary metrics) feature a custom teal glow (`box-shadow: 0 0 15px rgba(0, 242, 255, 0.3)`).
* **Buttons & Tags:** Usually pill-shaped (`rounded-full`) or highly rounded (`rounded-xl` or `rounded-2xl`). Primary actions use the Cyber Teal, while secondary actions use subtle glass-white backgrounds.
* **Scrollbars:** Custom, ultra-thin (4px) dark scrollbars with no track background, ensuring the UI feels custom and polished.

## 5. Layout Principles
* **Structure:** A persistent left sidebar (256px wide) combined with a top sticky header (80px tall) featuring a backdrop blur.
* **Spacing & Grids:** Copious inner padding within cards (mostly `24px` or `p-6`/`p-8`). The main content uses a standard 12-column grid with generous gaps (`gap-8`) separating distinct dashboard widgets.
* **Layering:** Elements are layered deliberately: the background -> glass cards -> subtle borders -> glowing neon foreground elements.

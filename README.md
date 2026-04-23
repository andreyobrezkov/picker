# Picker

Picker is a small React + Vite app for running a spin-the-wheel selection flow. You can load entries from JSON, add entries manually in the UI, assign weights and colors, and pick a winner with an animated canvas wheel.

## What It Does

- Spins a weighted wheel and returns a winner in a modal
- Imports segments from a JSON file by upload or drag and drop
- Lets you add segments manually from the configuration panel
- Supports optional subtitle, emoji, image URL, custom color, and weight per segment
- Includes switchable wheel color themes
- Can automatically disable a winner after each spin
- Starts with a built-in sample list so the app is usable immediately

## Tech Stack

- React 19
- Vite 6
- CSS Modules
- Canvas rendering for the wheel

## Getting Started

### Requirements

- Node.js 18+ is the safe baseline for Vite 6

### Install

Using `npm`:

```bash
npm install
```

Using `yarn`:

```bash
yarn install
```

### Run Locally

```bash
npm run dev
```

or

```bash
yarn dev
```

Vite will print the local development URL in the terminal.

### Build

```bash
npm run build
```

or

```bash
yarn build
```

### Preview Production Build

```bash
npm run preview
```

## How To Use

1. Open the app and stay on the `Spin` page.
2. Load data by either:
   - uploading a JSON file,
   - dragging a JSON file into the page,
   - or adding segments manually.
3. Optionally enable `Remove after win` if winners should be disabled after selection.
4. Open `Settings` to choose a wheel palette.
5. Press `SPIN`.

## JSON Format

The importer accepts either:

- an array of segment objects, or
- an object with a `segments` array

### Supported Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `label` | string | Yes | Display name shown on the wheel and in the result modal |
| `subtitle` | string | No | Secondary line shown in the list and result modal |
| `icon` | string | No | Remote image URL shown on the wheel and in the result modal |
| `emoji` | string | No | Used when no image is provided |
| `color` | string | No | Hex or CSS color string; overrides the selected theme for that segment |
| `weight` | number | No | Relative probability; values `> 0` are used, otherwise the app falls back to `1` |

### Example

```json
[
  {
    "label": "Alice Chen",
    "subtitle": "Engineering",
    "icon": "https://i.pravatar.cc/150?img=1",
    "weight": 1
  },
  {
    "label": "Bob Torres",
    "subtitle": "Product",
    "emoji": "📦",
    "color": "#0077b6",
    "weight": 2
  }
]
```

## Current Import Behavior

- `label` is the only required field.
- Imported segments are enabled by default.
- The current parser does not read an `enabled` flag from JSON.
- If the JSON is invalid, or no valid segment array is found, the app shows an error banner.

## Notes

- Remote avatar/image URLs should allow cross-origin loading, otherwise the wheel will render the segment without the image.
- Theme colors only fill missing segment colors. If a segment already has `color`, that value wins.
- There is no persistence layer at the moment, so refreshing the page resets the current wheel state.

## Project Structure

```text
src/
  components/
    SegmentList.jsx
    Settings.jsx
    Wheel.jsx
    WinnerModal.jsx
  utils/
    defaultSegments.js
    parseSegments.js
    themes.js
  App.jsx
  main.jsx
```

## Scripts

- `npm run dev` / `yarn dev`: start the Vite dev server
- `npm run build` / `yarn build`: create a production build in `dist/`
- `npm run preview` / `yarn preview`: preview the production build locally

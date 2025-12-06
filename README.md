# Flight Booking App - Complete Project Guide

## 📋 Project Overview

A modern, responsive flight booking application built with React, TypeScript, Vite, and Tailwind CSS.

---

## 🗂️ Complete File Structure

```
flight-booking-app/
├── public/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── HeroSearch.tsx
│   │   ├── FeaturedPartners.tsx
│   │   ├── SpecialOffers.tsx
│   │   ├── TopDeals.tsx
│   │   ├── Statistics.tsx
│   │   ├── Testimonials.tsx
│   │   └── Footer.tsx
│   ├── data/
│   │   └── mockData.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Quick Setup

### 1. Create Project

```bash
npm create vite@latest flight-booking-app -- --template react-ts
cd flight-booking-app
```

### 2. Install Dependencies

```bash
npm install
npm install -D tailwindcss postcss autoprefixer
npm install lucide-react
npx tailwindcss init -p
```

### 3. Create Folder Structure

```bash
mkdir -p src/components src/types src/data
```

---

## 📄 File Contents

### **tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### **src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### **src/main.tsx**

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 📦 Component Files

Copy each component from the artifacts provided:

1. **src/types/index.ts** - TypeScript interfaces
2. **src/data/mockData.ts** - Static data
3. **src/components/Header.tsx** - Navigation header
4. **src/components/HeroSearch.tsx** - Flight search form
5. **src/components/FeaturedPartners.tsx** - Airlines showcase
6. **src/components/SpecialOffers.tsx** - Destination offers
7. **src/components/TopDeals.tsx** - Tabbed deals section
8. **src/components/Statistics.tsx** - Stats and benefits
9. **src/components/Testimonials.tsx** - Customer reviews
10. **src/components/Footer.tsx** - Footer links
11. **src/App.tsx** - Main app component

---

## 🎯 Features Implemented

### ✅ Header Component

- Responsive navigation
- Mobile menu toggle
- Country selector
- User profile display

### ✅ HeroSearch Component

- Multi-tab interface (Flight, Visa, Hotel, Package)
- Location selector with swap function
- Date picker fields
- Passenger and room counter
- Trip type radio buttons
- Cabin class selector
- Responsive grid layout

### ✅ FeaturedPartners Component

- Airline logos display
- Hover effects
- Responsive flex layout

### ✅ SpecialOffers Component

- 4-column grid layout
- Image hover zoom effect
- Pricing display
- "View all" button

### ✅ TopDeals Component

- Tabbed navigation
- Dynamic content switching
- Rating and review display
- Per-night pricing

### ✅ Statistics Component

- Customer count showcase
- 4 value propositions with icons
- Icon color variants
- CTA button

### ✅ Testimonials Component

- Overall rating display
- 3 customer reviews
- Star rating visualization
- Verified customer badges

### ✅ Footer Component

- 4-column layout
- Navigation links
- Social media icons
- Payment method logos
- Copyright notice

---

## 🎨 Design Features

- **Responsive Design** - Mobile, tablet, and desktop layouts
- **Modern Gradients** - Cyan to blue gradient header
- **Smooth Transitions** - Hover effects and animations
- **Clean Typography** - Clear hierarchy and readability
- **Consistent Spacing** - Proper padding and margins
- **Interactive Elements** - Buttons, tabs, and cards
- **Image Optimization** - Unsplash integration with proper sizing

---

## 🏃 Running the Project

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Visit: `http://localhost:5173`

---

## 🛠️ Customization Guide

### Change Colors

Edit `src/index.css` or use Tailwind's color utilities:

- Primary: `cyan-600`, `blue-600`
- Success: `green-600`
- Warning: `orange-600`

### Add More Destinations

Edit `src/data/mockData.ts`:

```typescript
export const specialOffers: Destination[] = [
  // Add new destination objects
];
```

### Modify Components

Each component is self-contained in `src/components/`

### Update Types

Add new interfaces in `src/types/index.ts`

---

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px

Tailwind breakpoints used:

- `sm:` 640px
- `md:` 768px
- `lg:` 1024px

---

## 🐛 Troubleshooting

### Tailwind not working?

1. Check `tailwind.config.js` content paths
2. Ensure `@tailwind` directives in `index.css`
3. Restart dev server

### Import errors?

1. Verify all files are in correct folders
2. Check file extensions (.tsx, .ts)
3. Ensure all exports are correct

### Images not loading?

1. Check internet connection (using Unsplash)
2. Verify image URLs in `mockData.ts`
3. Check browser console for errors

---

## 🚀 Next Steps

1. **Add Functionality**

   - Implement date picker
   - Add search logic
   - Connect to booking API

2. **Enhance UI**

   - Add loading states
   - Implement error handling
   - Add animations with Framer Motion

3. **State Management**

   - Add React Context
   - Implement Redux/Zustand
   - Add form validation

4. **Backend Integration**
   - Connect to flight API
   - Add authentication
   - Implement booking flow

---

## 📚 Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [TypeScript](https://www.typescriptlang.org/)

---

## ✨ Credits

Built with ❤️ using modern web technologies

Happy Coding! 🎉

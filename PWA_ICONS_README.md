# PWA Icons - Quick Reference

## ✅ Icons Generated Successfully!

All required PWA icons have been generated and are located in `public/icons/`.

## Generated Icons

| Icon | Size | Purpose |
|------|------|---------|
| icon-72x72.png | 72x72 | Small devices |
| icon-96x96.png | 96x96 | Medium devices |
| icon-128x128.png | 128x128 | Desktop notifications |
| icon-144x144.png | 144x144 | Windows tablets |
| icon-152x152.png | 152x152 | iPad |
| icon-192x192.png | 192x192 | Android home screen |
| icon-384x384.png | 384x384 | Large displays |
| icon-512x512.png | 512x512 | Splash screens |
| badge-72x72.png | 72x72 | Notification badge |

**Total Size**: ~68KB

## Icon Design

The generated icons feature:
- **Gradient Background**: Cyan gradient (#06b6d4 to #0891b2)
- **Airplane Symbol**: White airplane icon in the center
- **Text**: "FlightBook" text on larger icons (192px+)
- **Rounded Corners**: 10% border radius for modern look
- **Maskable**: All icons support maskable purpose for adaptive icons

## Regenerating Icons

If you need to regenerate the icons (e.g., with a new design):

```bash
# Using npm script
npm run generate-icons

# Or directly
node generate-icons.cjs
```

## Customizing Icons

To customize the icons, edit `generate-icons.cjs`:

1. **Change colors**: Modify the gradient stop colors
2. **Change design**: Update the SVG path elements
3. **Add logo**: Include your company logo SVG
4. **Adjust text**: Change the "FlightBook" text

Example color change:
```javascript
// In generate-icons.cjs, find this line:
<stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />

// Change to your brand color:
<stop offset="0%" style="stop-color:#YOUR_COLOR;stop-opacity:1" />
```

## Using Custom Icons

If you have a custom logo/icon:

### Option 1: Use Online Tool
1. Go to https://realfavicongenerator.net/
2. Upload your logo (recommended: 512x512 PNG or SVG)
3. Configure maskable settings
4. Download and replace files in `public/icons/`

### Option 2: Use Figma/Photoshop
1. Create 512x512 base design
2. Export all required sizes
3. Place in `public/icons/`
4. Ensure filenames match manifest.json

### Option 3: Modify the Script
Edit `generate-icons.cjs` to include your custom SVG or image:

```javascript
// Load custom image
const customImage = fs.readFileSync('path/to/your/logo.png');

// Composite onto background
await sharp({
  create: {
    width: size,
    height: size,
    channels: 4,
    background: { r: 6, g: 182, b: 212, alpha: 1 }
  }
})
.composite([{
  input: customImage,
  gravity: 'center'
}])
.png()
.toFile(iconPath);
```

## Manifest Configuration

The icons are referenced in `public/manifest.json`:

```json
{
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    // ... other sizes
  ]
}
```

## Testing Icons

### 1. Chrome DevTools
1. Open DevTools (F12)
2. Go to Application → Manifest
3. Check all icons load without errors
4. Preview icons in different sizes

### 2. Lighthouse PWA Audit
1. Open DevTools → Lighthouse
2. Select "Progressive Web App"
3. Run audit
4. Check "Installable" section
5. Should see green checkmarks for icons

### 3. Install Test
1. Open your app in browser
2. Look for install prompt or browser menu
3. Click "Install" or "Add to Home Screen"
4. Check icon appears correctly on home screen

## Browser-Specific Icons

### iOS Safari
- Uses 152x152 and 180x180 (add if needed)
- Prefers opaque backgrounds (no transparency)
- Add apple-touch-icon in index.html:
```html
<link rel="apple-touch-icon" href="/icons/icon-152x152.png">
```

### Android Chrome
- Uses 192x192 for home screen
- Uses 512x512 for splash screen
- Supports maskable icons for adaptive icons

### Windows
- Uses 144x144 for tiles
- Can use square150x150logo (add if needed)

## File Structure

```
public/
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   └── badge-72x72.png
├── manifest.json (references icons)
└── vite.svg (fallback)
```

## Performance Tips

- ✅ Icons are optimized PNG format
- ✅ Total size kept under 100KB
- ✅ Lazy-loaded (only downloaded when needed)
- ✅ Cached by service worker
- ✅ SVG fallback available (vite.svg)

## Troubleshooting

### Icons not showing
1. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. Clear cache: DevTools → Application → Clear storage
3. Check manifest: DevTools → Application → Manifest
4. Verify file paths in manifest.json

### Wrong icon showing
1. Uninstall PWA if already installed
2. Clear browser cache
3. Regenerate icons
4. Reinstall PWA

### "Download error" in console
1. Check file exists: `ls public/icons/`
2. Check permissions: Files should be readable
3. Check dev server is serving static files
4. Try accessing directly: http://localhost:5173/icons/icon-192x192.png

## Next Steps

1. ✅ Icons generated and working
2. ✅ Manifest configured correctly
3. ✅ PWA installable
4. 🔄 Customize icons with your brand (optional)
5. 🔄 Add apple-touch-icon for iOS (optional)
6. 🔄 Test on actual devices (optional)

## Resources

- [Web.dev - Add a web app manifest](https://web.dev/add-manifest/)
- [MDN - Web app manifests](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Maskable.app - Test maskable icons](https://maskable.app/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

---

**Generated**: December 23, 2025
**Script**: `generate-icons.cjs`
**Library**: sharp v0.33+

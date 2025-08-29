# Class Schedule Styling App

An intuitive web application for creating beautiful, printable class schedules with WYSIWYG editing and guaranteed single-page PDF output.

## Features

- **Fixed-Page WYSIWYG Canvas**: Edit on a canvas that represents exactly what will be printed on US Letter paper (8.5" x 11")
- **Click-and-Type Editing**: Simply click on any time slot and start typing - no forms to fill out
- **Live Styling**: Real-time theme changes, font adjustments, and background customization
- **Smart Font Sizing**: Pre-tested font sizes (Small, Medium, Large) that guarantee the schedule fits on one page
- **Automatic Background Fit**: Upload background images that automatically scale to fit perfectly
- **Guaranteed Single-Page PDF**: Export always produces a perfectly formatted US Letter page
- **Auto-Save**: Your work is automatically saved to browser storage
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Quick Start

1. **Open the app**: Simply open `index.html` in your web browser
2. **Add classes**: Click on any time slot and type your class information
3. **Customize**: Use the left panel to change themes, fonts, or add a background
4. **Download**: Click "Download PDF" to get your printable schedule

## Running the App

### Option 1: Direct File Opening
Simply double-click `index.html` to open it in your default web browser.

### Option 2: Local Server (Recommended)
For the best experience, run a local server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (if you have it installed)
npx http-server

# Using npm (after running npm install)
npm start
```

Then open `http://localhost:8000` in your browser.

## Usage Guide

### Adding Classes
1. Click on any cell in the schedule grid
2. Type your class information (e.g., "Math 101", "Room A-204")
3. Press Enter or click elsewhere to save

### Customizing Appearance
- **Themes**: Click any color theme in the gallery for instant application
- **Fonts**: Choose from 5 different font families
- **Font Size**: Select Small, Medium, or Large (all guaranteed to fit on one page)
- **Background**: Upload an image that will automatically fit the page

### Downloading PDF
- Click the "Download PDF" button
- Your schedule will be saved as a perfectly formatted US Letter PDF
- The PDF will look identical to what you see on screen

### Keyboard Shortcuts
- `Ctrl/Cmd + P`: Download PDF
- `Escape`: Exit cell editing mode

## Technical Details

### Built With
- **HTML5**: Semantic structure with contenteditable cells
- **CSS3**: Fixed aspect ratio canvas, responsive design, theme system
- **Vanilla JavaScript**: No frameworks - fast and lightweight
- **jsPDF**: High-quality PDF generation
- **jsPDF-AutoTable**: Professional table formatting in PDFs

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### File Structure
```
class-schedule/
├── index.html          # Main HTML structure
├── styles.css          # All styling and themes
├── script.js           # Application logic and PDF generation
├── package.json        # Project configuration
├── design_doc.md       # Design specifications
└── README.md           # This file
```

## Customization

### Adding New Themes
To add a new theme, edit `styles.css`:

1. Add a new theme option in the HTML
2. Define CSS custom properties for the theme
3. Add corresponding PDF styles in `script.js`

### Modifying Time Slots
Edit the table structure in `index.html` to add/remove time slots or change the schedule layout.

### Adjusting PDF Output
Modify the `getPDFStyles()` and `generatePDF()` functions in `script.js` to customize PDF appearance.

## Troubleshooting

**PDF not downloading?**
- Ensure you're using a modern browser
- Check that JavaScript is enabled
- Try using a local server instead of opening the file directly

**Text not fitting in PDF?**
- Use a smaller font size
- Keep class names concise
- The app automatically truncates long text to ensure fit

**Background image not showing?**
- Ensure the image file is under 5MB
- Use common formats (JPG, PNG, GIF)
- The image will automatically scale to fit

## License

MIT License - feel free to use and modify for your needs.

## Contributing

This is a standalone project, but suggestions and improvements are welcome!
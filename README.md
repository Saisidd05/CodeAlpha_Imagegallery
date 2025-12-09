# CodeAlpha_Imagegallery

A fully responsive, interactive image gallery built with HTML, CSS, and JavaScript featuring a modern dark theme, advanced filtering, image effects, and persistent storage.

## Features

### 🖼️ Gallery Display
- **Responsive Grid Layout** - Auto-fit grid that adapts to all screen sizes (mobile, tablet, desktop)
- **Lazy Loading** - Images load efficiently on demand
- **Hover Animations** - Smooth scaling and elevation effects on card hover
- **Modern Dark Theme** - Professional gradient backgrounds with glassmorphism effects

### 🔍 Lightbox View
- **Full-Screen Image Viewing** - Click any image to open an interactive lightbox
- **Navigation Controls** - Previous/Next buttons to browse through images
- **Image Metadata** - Display image title and photographer information
- **Thumbnail Strip** - Quick navigation between images via thumbnail preview
- **Download Option** - Direct download button for full-resolution images
- **Responsive** - Hides navigation arrows on mobile devices

### 🎨 Image Effects
- **Grayscale Filter** - Convert images to black & white
- **Sepia Filter** - Warm vintage tone effect
- **Blur Effect** - Subtle blur filter for all gallery images
- **Real-time Application** - Effects apply instantly to all visible images

### 🏷️ Category Filtering
- **Filter by Category** - All, Nature, Architecture, People, Animals
- **Active State Indicators** - Visual feedback for selected filters
- **Instant Filtering** - Gallery updates immediately when filter changes

### ➕ Image Management
- **Add Images** - Floating action button to add new images
- **Edit Images** - Modify image details (URL, title, photographer, category)
- **Delete Images** - Remove images with confirmation dialog
- **Modal Form** - Clean, intuitive interface for image management
- **URL Support** - Add both standard and high-resolution image URLs

### 💾 Persistent Storage
- **LocalStorage Integration** - Gallery data persists across browser sessions
- **Automatic Saving** - Changes save automatically to local storage
- **Data Restoration** - Gallery loads previous state on page refresh

### 📱 Responsive Design
- **Mobile Optimized** - Fully functional on small screens
- **Flexible Grid** - Adapts grid columns based on viewport width
- **Touch-Friendly** - Large tap targets for mobile interactions
- **Optimized Lightbox** - Simplified controls on mobile devices

### ♿ Accessibility
- **ARIA Labels** - Semantic HTML with proper ARIA attributes
- **Keyboard Navigation** - Full keyboard support for all interactions
- **Screen Reader Friendly** - Proper alt text and role definitions
- **Focus Management** - Clear visual indicators for keyboard navigation

## Technical Stack

- **HTML5** - Semantic structure with ARIA landmarks
- **CSS3** - Modern styling with CSS Grid, Flexbox, and gradients
- **JavaScript (Vanilla)** - Pure JS implementation without frameworks
- **LocalStorage API** - Client-side data persistence
- **Google Fonts** - Inter font family for typography

## Project Structure

```
├── index.html      # Main HTML structure with form and lightbox modal
├── styles.css      # Complete styling (114 lines)
├── script.js       # All JavaScript logic (420 lines)
├── README.md       # Project documentation
```

## Getting Started

1. Open `index.html` in a web browser
2. Click the floating **+** button to add images
3. Use filter buttons to browse by category
4. Select an effect from the dropdown to apply filters
5. Click any image to open the lightbox view
6. Edit or delete images using the card controls

## Browser Compatibility

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Supports modern CSS features (Grid, Flexbox, Gradients, Backdrop-filter)

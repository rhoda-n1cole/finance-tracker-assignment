# Personal Finance Manager

A modern, responsive web application for tracking personal finances, built with vanilla JavaScript, HTML5, and CSS3. Features include transaction management, budget tracking, data visualization, and advanced search capabilities with a sleek top navigation interface.

## 🎯 Theme
**Personal Finance Manager** - A comprehensive tool for managing personal budgets, tracking expenses, and analyzing spending patterns with a modern interface.

## ✨ Features

### Core Functionality
- **Transaction Management**: Add, edit, and delete financial transactions
- **Dashboard Analytics**: View spending statistics and trends
- **Category Organization**: Organize expenses by categories (Food, Books, Transport, Entertainment, Fees, Other)
- **Search & Filter**: Advanced regex-based search with highlighting
- **Data Persistence**: Auto-save to localStorage with JSON import/export
- **Currency Support**: Base currency + 2 alternative currencies with manual rates
- **Responsive Design**: Mobile-first layout with 3+ breakpoints

### Advanced Features
- **7-Day Trend Chart**: Visual representation of spending patterns
- **Budget Management**: Set monthly caps with over-budget alerts
- **Real-time Validation**: 4+ regex validation rules with instant feedback
- **Accessibility**: Full keyboard navigation, ARIA live regions, screen reader support
- **Dark/Light Theme**: Persistent theme switching

## 🔧 Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rhoda-n1cole/finance-tracker-assignment
   cd finance-tracker-assignment
   ```

2. **Open in browser**:
   - Simply open `index.html` in any modern web browser
   - Or use a local server: `python -m http.server 8000`

3. **No dependencies required** - Pure vanilla HTML, CSS, and JavaScript

## 🧪 Testing

Run the test suite by opening `tests.html` in your browser. The tests verify:
- Regex validation rules
- Form functionality
- Data persistence
- Search capabilities

## 📱 Responsive Breakpoints

- **Mobile**: ~360px and up
- **Tablet**: 768px and up  
- **Desktop**: 1024px and up
- **Large Desktop**: 1200px and up

## ⌨️ Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and form controls
- **Escape**: Close modals and mobile menu
- **Arrow Keys**: Navigate table rows (when focused)
- **Skip Link**: Press Tab on page load to skip to main content

## 🔍 Regex Catalog

### Validation Patterns
1. **Description**: `/^\S(?:.*\S)?$/` - No leading/trailing spaces
2. **Amount**: `/^(0|[1-9]\d*)(\.\d{1,2})?$/` - Positive numbers with max 2 decimals
3. **Date**: `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/` - YYYY-MM-DD format
4. **Advanced - Duplicate Words**: `/\b(\w+)\s+\1\b/i` - Detects repeated words

### Search Patterns
- **Cents Present**: `/\.\d{2}\b/` - Find amounts with cents
- **Beverage Keywords**: `/(coffee|tea)/i` - Find beverage-related transactions
- **Duplicate Words**: `/\b(\w+)\s+\1\b/` - Find descriptions with repeated words

## ♿ Accessibility Features

- **Semantic HTML**: Proper landmarks and heading hierarchy
- **ARIA Live Regions**: Status updates announced to screen readers
- **Skip Links**: Quick navigation to main content
- **Keyboard Navigation**: Full functionality without mouse
- **Focus Indicators**: Clear visual focus states
- **Screen Reader Support**: Proper labels and descriptions
- **High Contrast**: Meets WCAG contrast requirements

## 🏗️ Architecture

### File Structure
```
finance-tracker-assignment/
├── index.html              # Main application
├── styles/
│   └── main.css            # Complete styling
├── scripts/
│   ├── app.js              # Main application controller
│   ├── state.js            # Data state management
│   ├── storage.js          # localStorage operations
│   ├── ui.js               # DOM manipulation
│   ├── validators.js       # Form validation
│   └── search.js           # Regex search functionality
├── tests.html              # Test suite
├── seed.json               # Sample data
└── README.md               # This file
```

### Module Organization
- **app.js**: Main controller, event handling, navigation
- **state.js**: Data management, CRUD operations, statistics
- **storage.js**: localStorage, import/export functionality
- **ui.js**: DOM updates, rendering, accessibility
- **validators.js**: Form validation, regex patterns
- **search.js**: Search functionality, highlighting

## 🚀 Deployment

This application is deployed on GitHub Pages. The live version can be accessed at:
[Your GitHub Pages URL]

## 📊 Sample Data

The application includes `seed.json` with 10+ diverse sample transactions including:
- Various categories and amounts
- Edge case dates (past, present, future)
- Different description formats
- Large and small monetary values

## 🎥 Demo Video

A 2-3 minute demonstration video showcasing:
- Keyboard navigation flow
- Regex search edge cases
- Import/export functionality
- Responsive design across devices
- Accessibility features

[Link to demo video]

## 👨‍💻 Developer

**NICOLE Rhoda Umutesi**
- GitHub: https://github.com/rhoda-n1cole/
- Email: r.umutesi1@alustudent.com

## 📄 License

This project is created for educational purposes as part of a summative assignment.


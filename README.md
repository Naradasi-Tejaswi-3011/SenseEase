# 🧠 SenseEase - Accessible Shopping for Everyone

**SenseEase** is a revolutionary web application that augments the Walmart online shopping experience for neurodiverse users (ADHD, autism, dyslexia, sensory sensitivity) while benefiting all users seeking a more focused, accessible interface.

![SenseEase Demo](https://images.unsplash.com/photo-1556742049-0cfed4f6a79d?w=800&h=400&fit=crop&crop=center)

## 🌟 Key Features

### 🧠 **Neurodiversity-First Design**
- **ADHD Support**: Focus mode, reduced distractions, simplified navigation
- **Autism Support**: Predictable layouts, clear navigation, reduced sensory overload
- **Dyslexia Support**: OpenDyslexic font, improved readability, clear typography
- **Sensory Sensitivity**: Reduced motion, adjustable colors, customizable contrast

### ⚡ **Adaptive UI Engine**
- **Real-time Adaptation**: UI changes based on user behavior and stress patterns
- **Smart Suggestions**: Automatic recommendations when confusion is detected
- **Personalized Experience**: Interface adapts to individual needs and preferences
- **Stress Detection**: Monitors user patterns and offers helpful interventions

### 🎯 **Accessibility Features**
- **WCAG 2.1 AA Compliant**: Full accessibility standards compliance
- **Screen Reader Support**: Complete ARIA implementation
- **Keyboard Navigation**: Full keyboard accessibility with shortcuts (Alt+A, Alt+F, Alt+M)
- **Focus Management**: Clear focus indicators and logical tab order

### 🛍️ **Enhanced Shopping Experience**
- **Distraction-Free Checkout**: No timers, clear instructions, extended timeouts
- **Visual Customization**: Text size, contrast, color adjustments
- **Motion Control**: Reduced animations and moving elements
- **Clear Communication**: Simple language, helpful tooltips

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Naradasi-Tejaswi-3011/SenseEase.git
   cd SenseEase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
SenseEase/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.jsx       # Navigation header with search
│   │   ├── Hero.jsx         # Beautiful landing page hero
│   │   ├── ProductCard.jsx  # Product display cards
│   │   ├── CategoryGrid.jsx # Category navigation
│   │   ├── AccessibilityToolbar.jsx # Accessibility controls
│   │   └── StressDetectionModal.jsx # Smart suggestions
│   ├── contexts/            # React Context providers
│   │   ├── UserProfileContext.jsx    # User preferences & profile
│   │   ├── AccessibilityContext.jsx  # Accessibility state
│   │   └── StressDetectionContext.jsx # Behavior monitoring
│   ├── pages/               # Main application pages
│   │   ├── HomePage.jsx     # Beautiful landing page
│   │   ├── OnboardingPage.jsx # Comprehensive user setup
│   │   ├── ProductPage.jsx  # Product details
│   │   ├── CartPage.jsx     # Shopping cart
│   │   ├── CheckoutPage.jsx # Accessible checkout
│   │   └── ProfilePage.jsx  # User settings
│   ├── data/                # Sample data and utilities
│   │   └── products.js      # Rich product catalog
│   └── utils/               # Helper functions
├── public/                  # Static assets
└── docs/                    # Documentation
```

## 🎨 Design System

### Color Palette
- **Primary Blue**: `#0071ce` (Walmart brand color)
- **Secondary Yellow**: `#ffc220` (Walmart accent)
- **Success Green**: `#10b981`
- **Warning Orange**: `#f59e0b`
- **Error Red**: `#ef4444`

### Typography
- **Primary Font**: Inter (clean, readable)
- **Dyslexic Font**: OpenDyslexic (accessibility)
- **Font Sizes**: 4 responsive levels (Small, Medium, Large, Extra Large)

### Accessibility Themes
- **High Contrast**: Black/White with yellow accents
- **Low Saturation**: Desaturated color palette
- **Colorblind Support**: Deuteranopia, Protanopia, Tritanopia filters

## ⌨️ Keyboard Shortcuts

- **Alt + A**: Open accessibility toolbar
- **Alt + F**: Toggle focus mode
- **Alt + M**: Skip to main content

## 🧪 Features Implemented

### ✅ **Core Features**
- [x] User Onboarding & Profile Setup
- [x] Adaptive UI Engine with real-time changes
- [x] Accessibility Toolbar with all controls
- [x] Stress/Confusion Detection System
- [x] Beautiful Product Catalog with real images
- [x] Focus Mode Implementation
- [x] WCAG 2.1 AA Compliance

### ✅ **UI Components**
- [x] Stunning Hero Section with animations
- [x] Professional Header with search
- [x] Enhanced Product Cards
- [x] Category Grid with hover effects
- [x] Stress Detection Modal
- [x] Comprehensive Onboarding Flow

### ✅ **Accessibility Features**
- [x] Screen Reader Support
- [x] Keyboard Navigation
- [x] Dyslexia-Friendly Fonts
- [x] High Contrast Mode
- [x] Motion Reduction
- [x] Text Size Controls
- [x] Colorblind Support

## 🌐 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+

## 📱 Responsive Design

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+
- **Large Desktop**: 1440px+

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Walmart**: For the inspiration and brand guidelines
- **OpenDyslexic**: For the dyslexia-friendly font
- **React Aria**: For accessibility components
- **Tailwind CSS**: For the utility-first CSS framework
- **Unsplash**: For high-quality product images

## 🗺️ Future Roadmap

- [ ] Voice navigation support
- [ ] AI-powered product recommendations
- [ ] Multi-language support
- [ ] Mobile app development
- [ ] Integration with real Walmart API
- [ ] Advanced analytics dashboard
- [ ] Complete checkout flow
- [ ] Product detail pages
- [ ] User reviews and ratings

---

**Built with ❤️ for the neurodivergent community**

*Making online shopping accessible, comfortable, and enjoyable for everyone.*

**For Walmart Sparkathon 2024** 🚀

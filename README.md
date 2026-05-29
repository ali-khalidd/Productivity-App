# Focus Room - Focus & Flourish

A cozy productivity app that helps you stay focused by filling a virtual jar with coins as you study or work.

## Concept
- Choose a focus session (1, 2, 4, or 6 hours)
- Watch your jar fill with coins as time passes
- If you switch tabs, the timer pauses (anti-procrastination!)
- Complete sessions to earn coins for your wallet
- Spend coins in the shop to decorate your space

## Features
- **Timer**: 4 duration options with real-time progress tracking
- **Tab Detection**: Automatically pauses when you switch tabs
- **Coin System**: Earn coins by completing focus sessions
- **Shop**: Purchase backgrounds, jar skins, and decorations
- **Inventory**: Equip and customize your cozy space
- **Streaks**: Daily streak counter to keep you motivated
- **History**: Track all your past sessions and stats
- **Ambient Sounds**: Optional background audio (rain, fireplace, cafe, forest)
- **Persistent Data**: All progress saved via localStorage

## How to Use
1. Open `index.html` in your browser
2. Select a focus duration
3. Click "Start Focus"
4. Stay on the tab while the timer runs
5. Complete the session to earn coins
6. Visit the Shop to buy decorations
7. Customize your space in the Decorations tab

## File Structure
```
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Cozy styles and animations
└── js/
    └── app.js          # Application logic
```

## Tech Stack
- HTML5
- CSS3 (with custom properties for theming)
- Vanilla JavaScript
- Web Audio API for ambient sounds
- Page Visibility API for tab detection
- localStorage for data persistence

## Aesthetic
- Warm, cozy color palette (creams, browns, soft greens)
- Smooth animations and transitions
- Glassmorphism jar with coin fill effect
- Floating particles and decorations
- Soft shadows and rounded corners

## Future Enhancements
- More shop items and themes
- Achievement system
- Export session data
- Multiple jar styles with animations
- Custom background uploads
- Sound effect volume controls

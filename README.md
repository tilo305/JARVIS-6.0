# JARVIS 6.0 - AI Assistant

A modern, intelligent AI assistant built with Next.js, TypeScript, and TailwindCSS.

## 🚀 Features

- **AI Chat Interface**: Interactive chat with simulated AI responses
- **Voice Input Support**: Voice recognition toggle (ready for implementation)
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Dark Mode Ready**: Built-in dark mode support
- **TypeScript**: Full type safety and better development experience
- **Responsive Design**: Works perfectly on all device sizes

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/tilo305/JARVIS-6.0.git
cd JARVIS-6.0
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
JARVIS-6.0/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and TailwindCSS
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main page component
├── components/             # Reusable UI components
│   └── ui/                # Base UI components
│       └── Button.tsx     # Button component with variants
├── lib/                    # Utility functions
│   └── utils.ts           # Common utility functions
├── types/                  # TypeScript type definitions
│   └── chat.ts            # Chat-related types
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # TailwindCSS configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## 🎨 Design System

JARVIS 6.0 features a custom design system with:

- **Color Palette**: Blue gradient theme (#0066CC to #00D4FF)
- **Typography**: Inter font family
- **Spacing**: Consistent spacing scale
- **Components**: Reusable, accessible components
- **Animations**: Smooth transitions and micro-interactions

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🚧 Future Enhancements

- [ ] Real AI integration (OpenAI, Claude, etc.)
- [ ] Voice recognition and synthesis
- [ ] File upload and processing
- [ ] Multi-language support
- [ ] User authentication
- [ ] Chat history persistence
- [ ] Advanced AI features (image generation, code analysis)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Iron Man's JARVIS
- Built with modern web technologies
- Designed for accessibility and user experience

---

**JARVIS 6.0** - Your AI assistant of the future! 🤖✨

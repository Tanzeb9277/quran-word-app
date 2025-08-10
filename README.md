# Quran Word App

A modern web application for exploring and learning Arabic words from the Quran with interactive features, quizzes, and comprehensive word analysis.

## 🚀 Features

- **Word Explorer**: Browse and search Arabic words from the Quran
- **Interactive Quizzes**: Test your knowledge with customizable quizzes
- **Surah Navigation**: Explore words by specific surahs
- **Tag System**: Filter words by grammatical categories and linguistic features
- **Word Bank**: Interactive learning with visual word representations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Built-in user management
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or Supabase)
- npm, yarn, or pnpm

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/quran-word-app.git
cd quran-word-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Database Configuration
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password
```

### 4. Database Setup

Run the database setup scripts:

```bash
# Create database tables
node scripts/setup-db.js

# Populate with Quran data
node scripts/populate-db.js

# Set up tag system
node scripts/setup-complete-tag-system.js
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
quran-word-app/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── explorer/          # Word explorer page
│   ├── game/              # Quiz game page
│   └── surahs/            # Surah listing page
├── components/             # Reusable React components
│   └── ui/                # shadcn/ui components
├── lib/                    # Utility functions and database
├── public/                 # Static assets and Quran data
├── scripts/                # Database setup and utility scripts
└── styles/                 # Global CSS and Tailwind config
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main tables:

- **words**: Quran word data with translations, grammar, and tags
- **tags**: Linguistic and grammatical tag definitions
- **active_quizzes**: User quiz progress and state

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📊 API Endpoints

- `GET /api/words/surahs` - List all surahs
- `GET /api/words/surah/[id]` - Get words for specific surah
- `GET /api/words/random-verse` - Get random verse for quizzes
- `GET /api/tags` - Get all available tags
- `POST /api/quiz/start` - Start a new quiz
- `POST /api/quiz/answer` - Submit quiz answer

## 🎯 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Quran data and translations
- Arabic language resources
- Open source community contributions

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

---

**Note**: This application is designed for educational and research purposes. Please ensure compliance with local regulations and respect for religious content.

# Contributing to Quran Word App

Thank you for your interest in contributing to the Quran Word App! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Bugs

- Use the GitHub issue tracker to report bugs
- Include detailed steps to reproduce the issue
- Provide your operating system and browser information
- Include any error messages or console logs

### Suggesting Features

- Open a new issue with the "enhancement" label
- Describe the feature and why it would be useful
- Include mockups or examples if possible

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Test your changes**: Ensure the app builds and runs correctly
5. **Commit your changes**: Use clear, descriptive commit messages
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Create a Pull Request**

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Git

### Local Development

1. Clone your fork: `git clone https://github.com/yourusername/quran-word-app.git`
2. Install dependencies: `npm install`
3. Set up environment variables (see README.md)
4. Set up the database (see README.md)
5. Start development server: `npm run dev`

### Code Style

- Use TypeScript for new files
- Follow the existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Follow React best practices

### Testing

- Test your changes thoroughly
- Ensure the app works on different screen sizes
- Test with different browsers if possible
- Verify that existing functionality still works

## 📁 Project Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - Reusable React components
- `lib/` - Utility functions and database configuration
- `public/` - Static assets and Quran data
- `scripts/` - Database setup and utility scripts
- `styles/` - Global CSS and Tailwind configuration

## 🗄️ Database Guidelines

- Don't modify the database schema without discussion
- Test database scripts thoroughly before committing
- Include migration scripts for schema changes
- Document any new database requirements

## 🎨 UI/UX Guidelines

- Follow the existing design system
- Use shadcn/ui components when possible
- Ensure accessibility standards are met
- Test responsive design on mobile devices
- Maintain consistent spacing and typography

## 📝 Documentation

- Update README.md if you add new features
- Document new API endpoints
- Update environment variable documentation
- Add inline code comments for complex logic

## 🔒 Security

- Never commit sensitive information (API keys, passwords)
- Validate user inputs
- Follow security best practices
- Report security vulnerabilities privately

## 🚀 Pull Request Guidelines

### Before Submitting

- Ensure your code follows the project's style guide
- Test your changes thoroughly
- Update documentation if needed
- Squash commits if you have multiple commits

### Pull Request Template

Use this template when creating a PR:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Tested locally
- [ ] All tests pass
- [ ] No console errors

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## 📞 Getting Help

- Open an issue for questions or problems
- Join our community discussions
- Check existing documentation and issues

## 🙏 Recognition

Contributors will be recognized in:
- Project README.md
- Release notes
- Contributor acknowledgments

Thank you for contributing to making the Quran Word App better! 🎉

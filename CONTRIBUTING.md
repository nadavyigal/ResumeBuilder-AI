# Contributing to ResumeBuilder AI

Thank you for your interest in contributing to ResumeBuilder AI! This document provides guidelines and information for contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/ResumeBuilder-AI.git
   cd ResumeBuilder-AI
   ```
3. **Set up the development environment** following the [Environment Setup Guide](docs/environment-setup.md)
4. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### 1. Code Style and Standards

- **TypeScript**: All new code should be written in TypeScript
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code formatting is handled by Prettier
- **Tailwind CSS**: Use Tailwind utility classes for styling

### 2. Commit Messages

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add password reset functionality
fix(ui): resolve mobile navigation issue
docs(readme): update installation instructions
```

### 3. Pull Request Process

1. **Update documentation** if your changes affect user-facing features
2. **Add tests** for new functionality
3. **Update the @plan.md** file if your changes complete or modify planned features
4. **Ensure all checks pass** (linting, type checking, tests)
5. **Create a pull request** with:
   - Clear title and description
   - Reference to any related issues
   - Screenshots for UI changes
   - Testing instructions

## Project Structure

Refer to [Project Structure](docs/project-structure.md) for detailed information about the codebase organization.

## Development Guidelines

### Component Development

- **Use TypeScript interfaces** for component props
- **Implement proper error handling** and loading states
- **Follow accessibility best practices** (WCAG 2.1 AA)
- **Use semantic HTML** elements
- **Implement responsive design** (mobile-first approach)

### State Management

- **Use React hooks** for local state
- **Leverage Supabase Auth** for authentication state
- **Implement proper error boundaries** for error handling

### API Integration

- **Use Supabase client** for database operations
- **Implement proper error handling** for API calls
- **Add loading states** for better UX
- **Follow security best practices** for data handling

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- **Unit tests**: For utility functions and components
- **Integration tests**: For user flows and API interactions
- **E2E tests**: For critical user journeys

## Documentation

### Code Documentation

- **Add JSDoc comments** for functions and components
- **Include usage examples** for complex components
- **Document API interfaces** and types

### User Documentation

- **Update README.md** for setup changes
- **Add feature documentation** in the `docs/` directory
- **Include screenshots** for UI features

## Issue Reporting

### Bug Reports

Include:
- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Environment details** (browser, OS, etc.)
- **Screenshots or videos** if applicable

### Feature Requests

Include:
- **Clear description** of the proposed feature
- **Use case and motivation** for the feature
- **Proposed implementation** (if you have ideas)
- **Mockups or wireframes** (if applicable)

## Security

- **Never commit sensitive data** (API keys, passwords, etc.)
- **Use environment variables** for configuration
- **Follow OWASP security guidelines**
- **Report security vulnerabilities** privately to the maintainers

## Code of Conduct

### Our Standards

- **Be respectful** and inclusive
- **Provide constructive feedback**
- **Focus on the code, not the person**
- **Help others learn and grow**

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing private information
- Other unprofessional conduct

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check the `docs/` directory first

## Recognition

Contributors will be recognized in:
- **README.md**: Contributors section
- **Release notes**: For significant contributions
- **GitHub**: Contributor graphs and statistics

Thank you for contributing to ResumeBuilder AI! 🚀
# Contributing to ECHOES

Thank you for your interest in contributing to ECHOES! This document provides guidelines and instructions for contributing.

## 🌟 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. ECHOES is an emotional wellness application, and we extend that same care to our community.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A [Gemini API key](https://aistudio.google.com/app/apikey) for testing AI features

### Setup

1. **Fork the repository** and clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ECHOES.git
   cd ECHOES
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

## 📁 Project Structure

```
ECHOES/
├── api/                    # Vercel serverless functions
├── components/             # React components
├── screens/                # Page-level components
├── services/               # API services
├── utils/                  # Utility functions
├── types/                  # TypeScript type definitions
├── i18n/                   # Internationalization
├── tests/                  # Test files
└── public/                 # Static assets
```

## 🔧 Development Guidelines

### TypeScript

- **Strict mode is enabled** — avoid `any` types
- Define interfaces for all props and state
- Use type guards for runtime type checking
- Export types from dedicated files in `types/`

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// ❌ Avoid
const handleClick = (e: any) => { ... }
```

### React Components

- Use functional components with hooks
- Extract logic into custom hooks when reusable
- Memoize expensive computations with `useMemo`
- Use `useCallback` for functions passed as props

```typescript
// ✅ Good - Memoized callback
const handleSubmit = useCallback(() => {
  // ...
}, [dependencies]);

// ✅ Good - Custom hook for reusable logic
function useDebounce<T>(value: T, delay: number): T {
  // ...
}
```

### Styling

- Use Tailwind CSS utility classes
- Follow the existing color scheme (gold, purple, obsidian)
- Support both light and dark themes
- Use CSS variables for theme colors

```tsx
// ✅ Good
<div className="bg-[var(--bg-primary)] text-[var(--text-primary)]">

// ❌ Avoid hardcoded colors
<div className="bg-[#0d0617]">
```

### Accessibility

- All interactive elements must be keyboard accessible
- Include ARIA labels for screen readers
- Support reduced motion preference
- Maintain focus indicators

```tsx
// ✅ Good
<button
  aria-label="Close dialog"
  onKeyDown={(e) => e.key === 'Escape' && onClose()}
>
```

### API Key Security

- **NEVER** commit API keys
- Use `apiKeyManager` for all API key operations
- User keys are stored in localStorage (BYOK model)
- Server-side keys use environment variables

```typescript
// ✅ Good
const apiKey = apiKeyManager.getApiKey();
if (!apiKey) {
  throw new Error('No API key configured');
}

// ❌ Never do this
const ai = new GoogleGenAI({ apiKey: 'AIzaSy...' });
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- apiKeyManager

# Watch mode
npm test -- --watch
```

### Writing Tests

- Place tests in `tests/` directory mirroring source structure
- Use descriptive test names
- Mock external dependencies
- Test edge cases and error states

```typescript
describe('ApiKeyManager', () => {
  it('should return false when no key is stored', () => {
    expect(apiKeyManager.hasApiKey()).toBe(false);
  });

  it('should validate key format', async () => {
    const result = await apiKeyManager.validateApiKey('short');
    expect(result.isValid).toBe(false);
  });
});
```

### Coverage Requirements

- Minimum 50% coverage for new code
- Critical utilities should have 80%+ coverage
- UI components can have lower coverage

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(canvas): add voice recording transcription
fix(api): handle rate limit errors gracefully
docs(readme): update installation instructions
test(utils): add apiKeyManager tests
```

## 🔀 Pull Request Process

1. **Create a feature branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following the guidelines above

3. **Run checks locally:**
   ```bash
   npm run typecheck
   npm run lint
   npm test
   npm run build
   ```

4. **Push and create PR:**
   ```bash
   git push origin feat/your-feature-name
   ```

5. **PR Description should include:**
   - Summary of changes
   - Related issue (if any)
   - Screenshots (for UI changes)
   - Testing steps

### PR Checklist

- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] New features have tests
- [ ] Accessibility maintained
- [ ] Responsive design checked
- [ ] i18n strings added (if applicable)
- [ ] Documentation updated (if applicable)

## 🐛 Reporting Bugs

1. Check existing issues first
2. Use the bug report template
3. Include:
   - Browser/OS version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/error logs

## 💡 Feature Requests

1. Check existing issues/discussions
2. Use the feature request template
3. Explain the use case and benefit
4. Consider implementation complexity

## 🌍 Internationalization

ECHOES supports multiple languages. When adding user-facing text:

1. Add the key to `i18n/locales/en.json`
2. Add translations to other locale files
3. Use the `useTranslation` hook:

```tsx
const { t } = useTranslation();
return <h1>{t('welcome.title')}</h1>;
```

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Gemini API](https://ai.google.dev/docs)

## 🙏 Thank You

Every contribution makes ECHOES better for people processing their emotions. Thank you for being part of this journey.

---

Questions? Open a discussion or reach out to the maintainers.

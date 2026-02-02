/**
 * Tests for i18n Configuration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock i18next and related modules
vi.mock('i18next', () => ({
  default: {
    use: vi.fn().mockReturnThis(),
    init: vi.fn().mockReturnThis(),
  },
}));

vi.mock('react-i18next', () => ({
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

vi.mock('i18next-browser-languagedetector', () => ({
  default: vi.fn(),
}));

// Mock locale files
vi.mock('../../i18n/locales/en.json', () => ({ default: { greeting: 'Hello' } }));
vi.mock('../../i18n/locales/es.json', () => ({ default: { greeting: 'Hola' } }));
vi.mock('../../i18n/locales/fr.json', () => ({ default: { greeting: 'Bonjour' } }));
vi.mock('../../i18n/locales/de.json', () => ({ default: { greeting: 'Hallo' } }));

describe('i18n', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('supportedLanguages', () => {
    it('should export supported languages', async () => {
      const { supportedLanguages } = await import('../../i18n');

      expect(supportedLanguages).toBeDefined();
      expect(Array.isArray(supportedLanguages)).toBe(true);
    });

    it('should include English', async () => {
      const { supportedLanguages } = await import('../../i18n');

      const english = supportedLanguages.find(lang => lang.code === 'en');
      expect(english).toBeDefined();
      expect(english?.name).toBe('English');
      expect(english?.nativeName).toBe('English');
    });

    it('should include Spanish', async () => {
      const { supportedLanguages } = await import('../../i18n');

      const spanish = supportedLanguages.find(lang => lang.code === 'es');
      expect(spanish).toBeDefined();
      expect(spanish?.name).toBe('Spanish');
      expect(spanish?.nativeName).toBe('Español');
    });

    it('should include French', async () => {
      const { supportedLanguages } = await import('../../i18n');

      const french = supportedLanguages.find(lang => lang.code === 'fr');
      expect(french).toBeDefined();
      expect(french?.name).toBe('French');
      expect(french?.nativeName).toBe('Français');
    });

    it('should include German', async () => {
      const { supportedLanguages } = await import('../../i18n');

      const german = supportedLanguages.find(lang => lang.code === 'de');
      expect(german).toBeDefined();
      expect(german?.name).toBe('German');
      expect(german?.nativeName).toBe('Deutsch');
    });

    it('should have exactly 4 supported languages', async () => {
      const { supportedLanguages } = await import('../../i18n');

      expect(supportedLanguages.length).toBe(4);
    });

    it('should have required properties for each language', async () => {
      const { supportedLanguages } = await import('../../i18n');

      supportedLanguages.forEach(lang => {
        expect(lang).toHaveProperty('code');
        expect(lang).toHaveProperty('name');
        expect(lang).toHaveProperty('nativeName');
        expect(typeof lang.code).toBe('string');
        expect(typeof lang.name).toBe('string');
        expect(typeof lang.nativeName).toBe('string');
      });
    });
  });

  describe('i18n initialization', () => {
    it('should export default i18n instance', async () => {
      const { default: i18n } = await import('../../i18n');

      expect(i18n).toBeDefined();
    });

    it('should configure i18n with use method', async () => {
      const i18nextModule = await import('i18next');
      await import('../../i18n');

      expect(i18nextModule.default.use).toHaveBeenCalled();
    });

    it('should call init method', async () => {
      const i18nextModule = await import('i18next');
      await import('../../i18n');

      expect(i18nextModule.default.init).toHaveBeenCalled();
    });
  });
});

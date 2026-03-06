/**
 * Tests for Time Awareness Utility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('TimeAwareness', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  describe('getTimeContext', () => {
    it('should return dawn greeting between 5am and 8am', async () => {
      vi.setSystemTime(new Date(2025, 0, 15, 6, 0, 0)); // 6:00 AM

      vi.resetModules();
      const { getTimeContext } = await import('../../utils/timeAwareness');

      const context = getTimeContext();

      expect(context.greeting).toBe('In the quiet of early morning...');
      expect(context.ritualSuggestion).toContain('sun rises');
      expect(context.period).toBe('night');
      expect(context.colors.primary).toBe('#483D8B');
    });

    it('should return day greeting between 8am and 5pm', async () => {
      vi.setSystemTime(new Date(2025, 0, 15, 12, 0, 0)); // 12:00 PM

      vi.resetModules();
      const { getTimeContext } = await import('../../utils/timeAwareness');

      const context = getTimeContext();

      expect(context.greeting).toBe('In the light of day...');
      expect(context.ritualSuggestion).toContain('moment of stillness');
    });

    it('should return dusk greeting between 5pm and 9pm', async () => {
      vi.setSystemTime(new Date(2025, 0, 15, 18, 0, 0)); // 6:00 PM

      vi.resetModules();
      const { getTimeContext } = await import('../../utils/timeAwareness');

      const context = getTimeContext();

      expect(context.greeting).toBe('As daylight fades...');
      expect(context.ritualSuggestion).toContain('golden hour');
    });

    it('should return night greeting between 9pm and 5am', async () => {
      vi.setSystemTime(new Date(2025, 0, 15, 23, 0, 0)); // 11:00 PM

      vi.resetModules();
      const { getTimeContext } = await import('../../utils/timeAwareness');

      const context = getTimeContext();

      expect(context.greeting).toBe('In the sanctuary of night...');
      expect(context.ritualSuggestion).toContain('world sleeps');
    });

    it('should return night greeting for early morning (2am)', async () => {
      vi.setSystemTime(new Date(2025, 0, 15, 2, 0, 0)); // 2:00 AM

      vi.resetModules();
      const { getTimeContext } = await import('../../utils/timeAwareness');

      const context = getTimeContext();

      expect(context.greeting).toBe('In the sanctuary of night...');
    });

    it('should always return consistent purple theme', async () => {
      vi.setSystemTime(new Date(2025, 0, 15, 12, 0, 0));

      vi.resetModules();
      const { getTimeContext } = await import('../../utils/timeAwareness');

      const context = getTimeContext();

      expect(context.colors.primary).toBe('#483D8B');
      expect(context.colors.secondary).toBe('#191970');
      expect(context.particleColor).toBe('230, 210, 255');
    });

    it('should return proper TimeContext type', async () => {
      vi.setSystemTime(new Date(2025, 0, 15, 10, 0, 0));

      vi.resetModules();
      const { getTimeContext } = await import('../../utils/timeAwareness');

      const context = getTimeContext();

      expect(context).toHaveProperty('period');
      expect(context).toHaveProperty('greeting');
      expect(context).toHaveProperty('colors');
      expect(context).toHaveProperty('particleColor');
      expect(context).toHaveProperty('ritualSuggestion');
    });

    it('should handle boundary at 5am (start of dawn)', async () => {
      vi.setSystemTime(new Date(2025, 0, 15, 5, 0, 0)); // Exactly 5:00 AM

      vi.resetModules();
      const { getTimeContext } = await import('../../utils/timeAwareness');

      const context = getTimeContext();

      expect(context.greeting).toBe('In the quiet of early morning...');
    });

    it('should handle boundary at 8am (start of day)', async () => {
      vi.setSystemTime(new Date(2025, 0, 15, 8, 0, 0)); // Exactly 8:00 AM

      vi.resetModules();
      const { getTimeContext } = await import('../../utils/timeAwareness');

      const context = getTimeContext();

      expect(context.greeting).toBe('In the light of day...');
    });

    it('should handle boundary at 5pm (start of dusk)', async () => {
      vi.setSystemTime(new Date(2025, 0, 15, 17, 0, 0)); // Exactly 5:00 PM

      vi.resetModules();
      const { getTimeContext } = await import('../../utils/timeAwareness');

      const context = getTimeContext();

      expect(context.greeting).toBe('As daylight fades...');
    });

    it('should handle boundary at 9pm (start of night)', async () => {
      vi.setSystemTime(new Date(2025, 0, 15, 21, 0, 0)); // Exactly 9:00 PM

      vi.resetModules();
      const { getTimeContext } = await import('../../utils/timeAwareness');

      const context = getTimeContext();

      expect(context.greeting).toBe('In the sanctuary of night...');
    });
  });
});

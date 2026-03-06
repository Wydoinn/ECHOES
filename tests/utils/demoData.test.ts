/**
 * Tests for Demo Data Utility
 */

import { describe, it, expect } from 'vitest';
import { DEMO_RESULT } from '../../utils/demoData';

describe('DemoData', () => {
  describe('DEMO_RESULT structure', () => {
    it('should have a reflection message', () => {
      expect(DEMO_RESULT.reflection).toBeDefined();
      expect(typeof DEMO_RESULT.reflection).toBe('string');
      expect(DEMO_RESULT.reflection.length).toBeGreaterThan(0);
    });

    it('should have a closure message', () => {
      expect(DEMO_RESULT.closureMessage).toBeDefined();
      expect(typeof DEMO_RESULT.closureMessage).toBe('string');
      expect(DEMO_RESULT.closureMessage.length).toBeGreaterThan(0);
    });

    it('should have a visual metaphor', () => {
      expect(DEMO_RESULT.visualMetaphor).toBeDefined();
      expect(typeof DEMO_RESULT.visualMetaphor).toBe('string');
    });

    it('should have a visual metaphor SVG path', () => {
      expect(DEMO_RESULT.visualMetaphorPath).toBeDefined();
      expect(typeof DEMO_RESULT.visualMetaphorPath).toBe('string');
      expect(DEMO_RESULT.visualMetaphorPath).toContain('M');
    });

    it('should have a ritual with three steps', () => {
      expect(DEMO_RESULT.ritual).toBeDefined();
      expect(DEMO_RESULT.ritual.step1).toBeDefined();
      expect(DEMO_RESULT.ritual.step2).toBeDefined();
      expect(DEMO_RESULT.ritual.step3).toBeDefined();
    });

    it('should have audio insight data', () => {
      expect(DEMO_RESULT.audioInsight).toBeDefined();
      expect(DEMO_RESULT.audioInsight?.suggestedLabel).toBeDefined();
      expect(DEMO_RESULT.audioInsight?.toneSummary).toBeDefined();
      expect(DEMO_RESULT.audioInsight?.wordSummary).toBeDefined();
    });

    it('should have emotional arc data', () => {
      expect(DEMO_RESULT.emotionalArc).toBeDefined();
      expect(DEMO_RESULT.emotionalArc?.overallArc).toBeDefined();
      expect(DEMO_RESULT.emotionalArc?.narrativeSummary).toBeDefined();
      expect(DEMO_RESULT.emotionalArc?.segments).toBeDefined();
      expect(Array.isArray(DEMO_RESULT.emotionalArc?.segments)).toBe(true);
    });

    it('should have valid emotional arc segments', () => {
      const segments = DEMO_RESULT.emotionalArc?.segments;

      expect(segments?.length).toBeGreaterThan(0);

      segments?.forEach(segment => {
        expect(segment.text).toBeDefined();
        expect(typeof segment.sentiment).toBe('number');
        expect(segment.sentiment).toBeGreaterThanOrEqual(-1);
        expect(segment.sentiment).toBeLessThanOrEqual(1);
        expect(segment.label).toBeDefined();
      });
    });

    it('should have aftercare data', () => {
      expect(DEMO_RESULT.aftercare).toBeDefined();
      expect(DEMO_RESULT.aftercare.summary).toBeDefined();
      expect(DEMO_RESULT.aftercare.practices).toBeDefined();
      expect(Array.isArray(DEMO_RESULT.aftercare.practices)).toBe(true);
    });

    it('should have valid aftercare practices', () => {
      const practices = DEMO_RESULT.aftercare.practices;

      expect(practices.length).toBeGreaterThan(0);

      practices.forEach(practice => {
        expect(practice.title).toBeDefined();
        expect(practice.description).toBeDefined();
        expect(practice.icon).toBeDefined();
        expect(practice.type).toBeDefined();
        expect(['physical', 'reflective', 'social']).toContain(practice.type);
      });
    });

    it('should have cathartic-release as overall arc', () => {
      expect(DEMO_RESULT.emotionalArc?.overallArc).toBe('cathartic-release');
    });

    it('should have at least 4 aftercare practices', () => {
      expect(DEMO_RESULT.aftercare.practices.length).toBeGreaterThanOrEqual(4);
    });
  });
});

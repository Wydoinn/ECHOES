
export interface TimeContext {
  period: 'night';
  greeting: string;
  colors: { primary: string; secondary: string };
  particleColor: string;
  ritualSuggestion: string;
}

// Consistent night purple theme
const THEME = {
  colors: { primary: '#483D8B', secondary: '#191970' },
  particleColor: '230, 210, 255'
};

// Time-aware content with consistent purple styling
const TIME_CONFIG: Record<string, { greeting: string; ritualSuggestion: string }> = {
  dawn:  { greeting: 'In the quiet of early morning...', ritualSuggestion: 'As the sun rises, consider the light returning to the world.' },
  day:   { greeting: 'In the light of day...', ritualSuggestion: 'While the world moves around you, find a moment of stillness.' },
  dusk:  { greeting: 'As daylight fades...', ritualSuggestion: 'In the golden hour of transition, release what no longer serves you.' },
  night: { greeting: 'In the sanctuary of night...', ritualSuggestion: 'When the world sleeps and secrets breathe, let go into the silence.' }
};

export const getTimeContext = (): TimeContext => {
  const hour = new Date().getHours();

  const timeKey =
    hour >= 5 && hour < 8   ? 'dawn' :
    hour >= 8 && hour < 17  ? 'day' :
    hour >= 17 && hour < 21 ? 'dusk' : 'night';

  const config = TIME_CONFIG[timeKey] ?? TIME_CONFIG.night ?? { greeting: 'Welcome', ritualSuggestion: 'Take a moment to reflect' };
  return {
    period: 'night',
    ...THEME,
    greeting: config.greeting,
    ritualSuggestion: config.ritualSuggestion
  };
};

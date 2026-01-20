
export interface TimeContext {
  period: 'dawn' | 'day' | 'dusk' | 'night';
  greeting: string;
  colors: { primary: string; secondary: string };
  particleColor: string; // "R, G, B" string for easy consumption
  ritualSuggestion: string;
}

export const getTimeContext = (): TimeContext => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 8) {
    return {
      period: 'dawn',
      greeting: 'In the quiet of early morning...',
      colors: { primary: '#FFE4B5', secondary: '#DDA0DD' }, // Soft peach/lavender
      particleColor: '255, 200, 180', // Warm Peach
      ritualSuggestion: 'As the sun rises, consider the light returning to the world.'
    };
  } else if (hour >= 8 && hour < 17) {
    return {
      period: 'day',
      greeting: 'In the light of day...',
      colors: { primary: '#E6E6FA', secondary: '#B0C4DE' }, // Lavender/LightSteelBlue
      particleColor: '200, 220, 255', // Daylight Blue
      ritualSuggestion: 'While the world moves around you, find a moment of stillness.'
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      period: 'dusk',
      greeting: 'As daylight fades...',
      colors: { primary: '#DDA0DD', secondary: '#9370DB' }, // Plum/MediumPurple
      particleColor: '255, 180, 200', // Sunset Pink
      ritualSuggestion: 'In the golden hour of transition, release what no longer serves you.'
    };
  } else {
    return {
      period: 'night',
      greeting: 'In the sanctuary of night...',
      colors: { primary: '#483D8B', secondary: '#191970' }, // DarkSlateBlue/MidnightBlue
      particleColor: '230, 210, 255', // Moonlit Purple
      ritualSuggestion: 'When the world sleeps and secrets breathe, let go into the silence.'
    };
  }
};

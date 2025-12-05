export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export enum ActivityLevel {
  SEDENTARY = 'Sedentary',
  LIGHT = 'Light',
  MODERATE = 'Moderate',
  ACTIVE = 'Active',
  VERY_ACTIVE = 'Very Active',
}

export enum Goal {
  LOSE = 'Lose Weight',
  MAINTAIN = 'Maintain',
  GAIN = 'Gain Muscle',
}

export enum Language {
  ID = 'id',
  EN = 'en',
}

export enum AppTheme {
  FUTURISTIC = 'Futuristic',
  ELEGANT = 'Simple Elegant',
  MODERN = 'Modern',
}

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  weight: number; // kg
  height: number; // cm
  activity: ActivityLevel;
  goal: Goal;
  tdee: number;
  customCalorieTarget?: number;
  language: Language;
  theme: AppTheme;
}

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export interface FoodLogEntry extends MacroNutrients {
  id: string;
  name: string;
  timestamp: number;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
}

export interface ActivityLogEntry {
  id: string;
  name: string;
  caloriesBurned: number;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // base64
  isSystem?: boolean;
}

export interface FoodInsight {
  foodName: string;
  nutritional_highlight: string;
  health_impact: string;
}

export interface DailyInsight {
  motivation: string;
  nextMealSuggestion: string;
  foodInsights: FoodInsight[];
}

// AI Response Schema Structure
export interface AIResponseData {
  reply: string;
  food_entry: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    meal_type_suggestion: string; // 'Breakfast', 'Lunch', etc.
  } | null;
  activity_entry: {
    name: string;
    calories_burned: number;
  } | null;
  
  // New Fields for Insights
  daily_motivation: string;
  next_meal_suggestion: string;
  food_analysis: {
    name: string;
    nutritional_highlight: string;
    health_impact: string;
  }[];

  suggestion: string; // Keep for backward compatibility/short tip
  sentiment: 'positive' | 'neutral' | 'constructive';
}
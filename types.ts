export interface FamilyMember {
  id: string;
  parentId: string | null;
  name: string;
  regionalName?: string;
  relationType: string; // e.g., "Self", "Son", "Daughter"
  birthDate?: string;
  deathDate?: string;
  spouseName?: string;
  spouseRegionalName?: string;
  photoUrl?: string;
  gender: 'male' | 'female' | 'other';
}

export interface TreeState {
  members: FamilyMember[];
  selectedId: string | null;
  language: IndianLanguage;
}

export enum IndianLanguage {
  Hindi = 'Hindi',
  Bengali = 'Bengali',
  Tamil = 'Tamil',
  Telugu = 'Telugu',
  Marathi = 'Marathi',
  Gujarati = 'Gujarati',
  Kannada = 'Kannada',
  Malayalam = 'Malayalam',
  Punjabi = 'Punjabi',
  Odia = 'Odia',
  Urdu = 'Urdu',
  Sanskrit = 'Sanskrit'
}

export const LANGUAGE_CODES: Record<IndianLanguage, string> = {
  [IndianLanguage.Hindi]: 'hi',
  [IndianLanguage.Bengali]: 'bn',
  [IndianLanguage.Tamil]: 'ta',
  [IndianLanguage.Telugu]: 'te',
  [IndianLanguage.Marathi]: 'mr',
  [IndianLanguage.Gujarati]: 'gu',
  [IndianLanguage.Kannada]: 'kn',
  [IndianLanguage.Malayalam]: 'ml',
  [IndianLanguage.Punjabi]: 'pa',
  [IndianLanguage.Odia]: 'or',
  [IndianLanguage.Urdu]: 'ur',
  [IndianLanguage.Sanskrit]: 'sa'
};

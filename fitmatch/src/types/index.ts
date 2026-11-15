// Shared TypeScript types — the contract between backend and frontend

export type Category = 'jeans' | 'tshirt' | 'shirt';
export type FitType = 'skinny' | 'slim' | 'straight' | 'relaxed' | 'baggy';
export type Gender = 'men' | 'women';
export type FitPref = 'snug' | 'regular' | 'roomy';

export type Measurements = Partial<
  Record<
    | 'height'
    | 'weight'
    | 'waist'
    | 'hip'
    | 'inseam'
    | 'chest'
    | 'shoulder'
    | 'neck'
    | 'sleeve',
    number
  >
>; // always centimetres (kilograms for weight)

export type Profile = {
  gender: Gender;
  fitPref: FitPref;
  measurements: Measurements;
  references?: { brandId: string; category: Category; size: string }[];
};

export type SizeResult = {
  size: string;
  confidence: 'high' | 'medium' | 'low';
  note: string;
  alternatives: { size: string; label: 'tight' | 'best' | 'loose' }[];
  breakdown: {
    measure: string;
    user: number;
    range: { min: number; max: number };
    status: 'good' | 'snug' | 'loose' | 'tight';
  }[];
  source: {
    brand: string;
    chartType: 'body' | 'garment';
    lastChecked: string;
    url?: string;
  };
};


export type CandidateCategory = "gospel" | "moderne_urbain";

export interface Candidate {
  id: string;
  slug: string;
  full_name: string;
  category: CandidateCategory;
  photo_url: string | null;
  bio: string | null;
  paid_votes: number;
  manual_votes: number;
  is_active: boolean;
  created_at: string;
}

export interface CandidateWithTotal extends Candidate {
  total_votes: number;
}

export interface Transaction {
  id: string;
  candidate_id: string;
  trans_id: string | null;
  external_id: string;
  nb_votes: number;
  amount: number;
  status: "PENDING" | "SUCCESSFUL" | "FAILED" | "EXPIRED";
  payer_phone: string | null;
  payer_name: string | null;
  created_at: string;
  confirmed_at: string | null;
}

export const CATEGORY_LABELS: Record<CandidateCategory, string> = {
  gospel: "Gospel",
  moderne_urbain: "Urbaine",
};

// Version courte utilisée dans les espaces étroits (badges de card).
export const CATEGORY_LABELS_SHORT: Record<CandidateCategory, string> = {
  gospel: "Gospel",
  moderne_urbain: "Urbaine",
};

export const PRICE_PER_VOTE = 100; // FCFA

export function computeAmount(nbVotes: number): number {
  return Math.max(1, Math.round(nbVotes)) * PRICE_PER_VOTE;
}

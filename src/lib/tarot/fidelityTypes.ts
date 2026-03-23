/**
 * Shapes for `src/data/fidelity/*.json` — multi-source Major Arcana + system bundle.
 * Fields are optional to stay tolerant as the dataset evolves.
 */

export type FidelityMeaningEntry = {
  type?: string | null;
  text?: string | null;
  source?: string | null;
  author?: string | null;
  year?: number | null;
  confidence?: string | null;
  notes?: string | null;
};

export type FidelitySymbolismMotif = {
  description?: string | null;
  meaning?: string | null;
  source?: string | null;
};

export type FidelityArchetypeEntry = {
  name?: string | null;
  tradition?: string | null;
  description?: string | null;
  source?: string | null;
  confidence?: string | null;
};

export type FidelityRelationshipEdge = {
  card?: string | null;
  explanation?: string | null;
  source?: string | null;
  confidence?: string | null;
};

export type FidelityMajorCard = {
  name?: string | null;
  arcana?: string | null;
  number?: number | null;
  golden_dawn?: Record<string, string | undefined> | null;
  core_meaning?: string | null;
  meanings?: FidelityMeaningEntry[] | null;
  keywords?: Record<string, string[] | null | undefined> | null;
  symbolism?: Record<string, FidelitySymbolismMotif | null | undefined> | null;
  archetype?: FidelityArchetypeEntry[] | null;
  numerology?: Record<string, unknown> | null;
  relationships?: {
    similar?: FidelityRelationshipEdge[] | null;
    contrasts?: FidelityRelationshipEdge[] | null;
    progression?: {
      previous?: FidelityRelationshipEdge | null;
      next?: FidelityRelationshipEdge | null;
    } | null;
    transformations?: Array<Record<string, unknown>> | null;
  } | null;
};

export type FidelitySourceRef = {
  id?: string | null;
  title?: string | null;
  author?: string | null;
  year?: number | null;
  type?: string | null;
};

export type FidelitySystemFile = {
  meta?: {
    version?: string | null;
    primary_sources?: FidelitySourceRef[] | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { NewRanking, Ranking } from '../types/ranking.ts';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export const supabase: SupabaseClient | null =
  isNonEmptyString(url) && isNonEmptyString(key) ? createClient(url, key) : null;

export class RankingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RankingError';
  }
}

function isValidNonNegativeInteger(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    Number.isInteger(value)
  );
}

function sanitizeName(name: string): string {
  return name.trim().slice(0, 20);
}

export async function saveRanking(data: NewRanking): Promise<void> {
  if (supabase === null) {
    throw new RankingError(
      'Supabase not configured: missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY'
    );
  }

  const name = sanitizeName(data.name);
  if (name.length === 0) {
    throw new RankingError('Invalid name: must be non-empty after trimming');
  }

  if (!isValidNonNegativeInteger(data.time_survived)) {
    throw new RankingError(
      'Invalid time_survived: must be a finite non-negative integer'
    );
  }
  if (!isValidNonNegativeInteger(data.level)) {
    throw new RankingError('Invalid level: must be a finite non-negative integer');
  }
  if (!isValidNonNegativeInteger(data.kills)) {
    throw new RankingError('Invalid kills: must be a finite non-negative integer');
  }
  if (!isValidNonNegativeInteger(data.score)) {
    throw new RankingError('Invalid score: must be a finite non-negative integer');
  }

  const payload = {
    name,
    time_survived: data.time_survived,
    level: data.level,
    kills: data.kills,
    score: data.score,
  };

  try {
    const { error } = await supabase.from('rankings').insert(payload);

    if (error !== null) {
      throw new RankingError(`Failed to save ranking: ${error.message}`);
    }
  } catch (err) {
    if (err instanceof RankingError) {
      throw err;
    }
    throw new RankingError(
      `Failed to save ranking: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

export async function getTopRankings(limit = 10): Promise<Ranking[]> {
  if (supabase === null) {
    return [];
  }

  if (!isValidNonNegativeInteger(limit)) {
    return [];
  }

  const cappedLimit = Math.min(limit, 100);

  try {
    const { data, error } = await supabase
      .from('rankings')
      .select('id, name, time_survived, level, kills, score, created_at')
      .order('score', { ascending: false })
      .limit(cappedLimit);

    if (error !== null) {
      return [];
    }

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(
      (item): Ranking => ({
        id: typeof item.id === 'number' ? item.id : undefined,
        name: typeof item.name === 'string' ? item.name : '',
        time_survived:
          typeof item.time_survived === 'number' ? item.time_survived : 0,
        level: typeof item.level === 'number' ? item.level : 0,
        kills: typeof item.kills === 'number' ? item.kills : 0,
        score: typeof item.score === 'number' ? item.score : 0,
        created_at:
          typeof item.created_at === 'string' ? item.created_at : undefined,
      })
    );
  } catch {
    return [];
  }
}

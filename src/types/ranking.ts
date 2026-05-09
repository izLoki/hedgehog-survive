export interface Ranking {
  id?: number;
  name: string;
  time_survived: number;
  level: number;
  kills: number;
  score: number;
  created_at?: string;
}

export type NewRanking = Omit<Ranking, 'id' | 'created_at'>;

export const RANKINGS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS rankings (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  time_survived bigint NOT NULL,
  level bigint NOT NULL,
  kills bigint NOT NULL,
  score bigint NOT NULL,
  created_at timestamptz DEFAULT now()
);
`.trim();

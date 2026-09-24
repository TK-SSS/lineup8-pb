import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export const KEYS = {
  players: 'lineup8:players',
  matches:  'lineup8:matches',
  lineups:  'lineup8:lineups',
}

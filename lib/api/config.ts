export const API_CONFIG = {
  // Rate limits and other global API settings
  DEFAULT_CACHE_TIME: 60 * 5, // 5 minutes in seconds
  DEFAULT_STALE_TIME: 60 * 1, // 1 minute in seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,

  // Game-specific API configurations
  RIOT_GAMES: {
    BASE_URL: "https://api.riotgames.com",
    REGIONS: ["na1", "euw1", "kr", "eun1", "br1", "jp1", "la1", "la2", "oc1", "tr1", "ru"],
    RATE_LIMIT: {
      REQUESTS_PER_SECOND: 20,
      REQUESTS_PER_MINUTE: 100,
    },
  },
  STEAM: {
    BASE_URL: "https://api.steampowered.com",
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 100,
    },
  },
  FACEIT: {
    BASE_URL: "https://open.faceit.com/data/v4",
    RATE_LIMIT: {
      REQUESTS_PER_SECOND: 10,
      REQUESTS_PER_MINUTE: 50,
    },
  },
  ESPORTS_DATA: {
    BASE_URL: "https://esports-api.lolesports.com/persisted/gw",
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 100,
    },
  },
}

// Environment variable keys
export const ENV_KEYS = {
  RIOT_API_KEY: "RIOT_API_KEY",
  STEAM_API_KEY: "STEAM_API_KEY",
  FACEIT_API_KEY: "FACEIT_API_KEY",
}

// API endpoints for our internal API
export const API_ENDPOINTS = {
  GAMES: "/games",
  TEAMS: "/teams",
  TOURNAMENTS: "/tournaments",
  MATCHES: "/matches",
  PROFILES: "/profiles",
  GAME_DATA: "/game-data",
}

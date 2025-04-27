import { BaseGameService, type GameServiceConfig } from "../core/base-game-service"
import type { ApiResponse } from "../core/api-client"
import type { GameProfile, GameStats, GameMatch, GameLeaderboard, GameTournament } from "../types/game-data"

interface RiotSummonerDTO {
  id: string
  accountId: string
  puuid: string
  name: string
  profileIconId: number
  revisionDate: number
  summonerLevel: number
}

interface RiotLeagueEntryDTO {
  leagueId: string
  summonerId: string
  summonerName: string
  queueType: string
  tier: string
  rank: string
  leaguePoints: number
  wins: number
  losses: number
  hotStreak: boolean
  veteran: boolean
  freshBlood: boolean
  inactive: boolean
}

interface RiotMatchDTO {
  metadata: {
    matchId: string
    participants: string[]
  }
  info: {
    gameCreation: number
    gameDuration: number
    gameEndTimestamp: number
    gameId: number
    gameMode: string
    gameName: string
    gameStartTimestamp: number
    gameType: string
    gameVersion: string
    mapId: number
    participants: RiotParticipantDTO[]
    platformId: string
    queueId: number
    teams: any[]
  }
}

interface RiotParticipantDTO {
  assists: number
  baronKills: number
  bountyLevel: number
  champExperience: number
  champLevel: number
  championId: number
  championName: string
  deaths: number
  doubleKills: boolean
  firstBloodKill: boolean
  goldEarned: number
  goldSpent: number
  individualPosition: string
  kills: number
  lane: string
  pentaKills: number
  puuid: string
  quadraKills: number
  role: string
  summonerId: string
  summonerLevel: number
  summonerName: string
  teamId: number
  teamPosition: string
  timeCCingOthers: number
  totalDamageDealt: number
  totalDamageDealtToChampions: number
  totalDamageTaken: number
  tripleKills: number
  win: boolean
}

export class LeagueOfLegendsService extends BaseGameService {
  private region: string
  private regionRouting: Record<string, string> = {
    na1: "americas",
    br1: "americas",
    la1: "americas",
    la2: "americas",
    euw1: "europe",
    eun1: "europe",
    tr1: "europe",
    ru: "europe",
    kr: "asia",
    jp1: "asia",
    oc1: "sea",
  }

  constructor(config: GameServiceConfig) {
    super(config)
    this.region = config.region || "na1"
  }

  private getRegionalUrl(endpoint: string): string {
    return `https://${this.region}.api.riotgames.com${endpoint}`
  }

  private getRoutingUrl(endpoint: string): string {
    const routingValue = this.regionRouting[this.region] || "americas"
    return `https://${routingValue}.api.riotgames.com${endpoint}`
  }

  async getPlayerProfile(summonerNameOrId: string): Promise<ApiResponse<GameProfile>> {
    try {
      // Check if input is a summoner ID or name
      const isSummonerId = summonerNameOrId.length > 30

      const endpoint = isSummonerId
        ? `/lol/summoner/v4/summoners/${summonerNameOrId}`
        : `/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerNameOrId)}`

      const response = await this.apiClient.get<RiotSummonerDTO>(this.getRegionalUrl(endpoint))

      if (response.error || !response.data) {
        return response as ApiResponse<any>
      }

      const summoner = response.data

      return {
        data: {
          id: summoner.id,
          username: summoner.name,
          displayName: summoner.name,
          avatarUrl: `https://ddragon.leagueoflegends.com/cdn/13.10.1/img/profileicon/${summoner.profileIconId}.png`,
          level: summoner.summonerLevel,
          region: this.region,
          gameSpecificData: {
            puuid: summoner.puuid,
            accountId: summoner.accountId,
          },
        },
        error: null,
        status: response.status,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getPlayerStats(summonerId: string): Promise<ApiResponse<GameStats>> {
    try {
      const endpoint = `/lol/league/v4/entries/by-summoner/${summonerId}`
      const response = await this.apiClient.get<RiotLeagueEntryDTO[]>(this.getRegionalUrl(endpoint))

      if (response.error || !response.data) {
        return response as ApiResponse<any>
      }

      const entries = response.data
      // Find solo queue entry if it exists
      const soloQueueEntry = entries.find((entry) => entry.queueType === "RANKED_SOLO_5x5") || entries[0]

      if (!soloQueueEntry) {
        return {
          data: {
            wins: 0,
            losses: 0,
            winRate: 0,
            totalMatches: 0,
          },
          error: null,
          status: response.status,
        }
      }

      const totalMatches = soloQueueEntry.wins + soloQueueEntry.losses
      const winRate = totalMatches > 0 ? (soloQueueEntry.wins / totalMatches) * 100 : 0

      return {
        data: {
          wins: soloQueueEntry.wins,
          losses: soloQueueEntry.losses,
          winRate: Math.round(winRate * 100) / 100,
          totalMatches,
          rank: soloQueueEntry.tier,
          rankTier: this.getTierValue(soloQueueEntry.tier),
          rankDivision: soloQueueEntry.rank,
          rankIconUrl: `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/ranked-emblems/emblem-${soloQueueEntry.tier.toLowerCase()}.png`,
          eloRating: soloQueueEntry.leaguePoints,
          gameSpecificStats: {
            queueType: soloQueueEntry.queueType,
            leaguePoints: soloQueueEntry.leaguePoints,
            hotStreak: soloQueueEntry.hotStreak,
            veteran: soloQueueEntry.veteran,
            freshBlood: soloQueueEntry.freshBlood,
            inactive: soloQueueEntry.inactive,
          },
        },
        error: null,
        status: response.status,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getRecentMatches(puuid: string, limit = 10): Promise<ApiResponse<GameMatch[]>> {
    try {
      const matchIdsEndpoint = `/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${limit}`
      const matchIdsResponse = await this.apiClient.get<string[]>(this.getRoutingUrl(matchIdsEndpoint))

      if (matchIdsResponse.error || !matchIdsResponse.data) {
        return matchIdsResponse as ApiResponse<any>
      }

      const matchIds = matchIdsResponse.data
      const matches: GameMatch[] = []

      // Get details for each match (limited to 5 to avoid rate limits)
      const matchesToFetch = matchIds.slice(0, 5)

      for (const matchId of matchesToFetch) {
        const matchEndpoint = `/lol/match/v5/matches/${matchId}`
        const matchResponse = await this.apiClient.get<RiotMatchDTO>(this.getRoutingUrl(matchEndpoint))

        if (!matchResponse.error && matchResponse.data) {
          const match = matchResponse.data
          const playerParticipant = match.info.participants.find((p) => p.puuid === puuid)

          matches.push({
            id: match.metadata.matchId,
            gameId: "league-of-legends",
            startTime: new Date(match.info.gameStartTimestamp).toISOString(),
            endTime: new Date(match.info.gameEndTimestamp).toISOString(),
            duration: match.info.gameDuration,
            mode: match.info.gameMode,
            result: playerParticipant?.win ? "win" : "loss",
            participants: match.info.participants.map((p) => ({
              id: p.puuid,
              profileId: p.summonerId,
              username: p.summonerName,
              teamId: p.teamId.toString(),
              champion: p.championName,
              role: p.teamPosition,
              stats: {
                kills: p.kills,
                deaths: p.deaths,
                assists: p.assists,
                score: p.kills + p.assists,
              },
            })),
            gameSpecificData: {
              queueId: match.info.queueId,
              mapId: match.info.mapId,
              gameVersion: match.info.gameVersion,
            },
          })
        }
      }

      return {
        data: matches,
        error: null,
        status: 200,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getMatch(matchId: string): Promise<ApiResponse<GameMatch>> {
    try {
      const endpoint = `/lol/match/v5/matches/${matchId}`
      const response = await this.apiClient.get<RiotMatchDTO>(this.getRoutingUrl(endpoint))

      if (response.error || !response.data) {
        return response as ApiResponse<any>
      }

      const match = response.data

      return {
        data: {
          id: match.metadata.matchId,
          gameId: "league-of-legends",
          startTime: new Date(match.info.gameStartTimestamp).toISOString(),
          endTime: new Date(match.info.gameEndTimestamp).toISOString(),
          duration: match.info.gameDuration,
          mode: match.info.gameMode,
          participants: match.info.participants.map((p) => ({
            id: p.puuid,
            profileId: p.summonerId,
            username: p.summonerName,
            teamId: p.teamId.toString(),
            champion: p.championName,
            role: p.teamPosition,
            stats: {
              kills: p.kills,
              deaths: p.deaths,
              assists: p.assists,
              score: p.kills + p.assists,
            },
          })),
          gameSpecificData: {
            queueId: match.info.queueId,
            mapId: match.info.mapId,
            gameVersion: match.info.gameVersion,
          },
        },
        error: null,
        status: response.status,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getLeaderboard(region?: string, limit = 100): Promise<ApiResponse<GameLeaderboard>> {
    try {
      const useRegion = region || this.region
      const queue = "RANKED_SOLO_5x5"
      const endpoint = `/lol/league/v4/challengerleagues/by-queue/${queue}`

      const response = await this.apiClient.get<any>(this.getRegionalUrl(endpoint))

      if (response.error || !response.data) {
        return response as ApiResponse<any>
      }

      const leagueData = response.data

      // Sort entries by LP
      const sortedEntries = leagueData.entries.sort((a: any, b: any) => b.leaguePoints - a.leaguePoints).slice(0, limit)

      return {
        data: {
          id: leagueData.leagueId,
          name: `${leagueData.tier} ${queue}`,
          region: useRegion,
          entries: sortedEntries.map((entry: any, index: number) => ({
            rank: index + 1,
            profileId: entry.summonerId,
            username: entry.summonerName,
            score: entry.leaguePoints,
            wins: entry.wins,
            losses: entry.losses,
            gameSpecificData: {
              tier: leagueData.tier,
              rank: entry.rank,
              hotStreak: entry.hotStreak,
              veteran: entry.veteran,
              freshBlood: entry.freshBlood,
              inactive: entry.inactive,
            },
          })),
          updatedAt: new Date().toISOString(),
        },
        error: null,
        status: response.status,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async searchPlayer(username: string): Promise<ApiResponse<GameProfile[]>> {
    // For LoL, this is just a wrapper around getPlayerProfile
    const response = await this.getPlayerProfile(username)

    if (response.error || !response.data) {
      return {
        data: [],
        error: response.error,
        status: response.status,
      }
    }

    return {
      data: [response.data],
      error: null,
      status: response.status,
    }
  }

  // Helper method to convert tier to numeric value for sorting
  private getTierValue(tier: string): number {
    const tiers: Record<string, number> = {
      IRON: 1,
      BRONZE: 2,
      SILVER: 3,
      GOLD: 4,
      PLATINUM: 5,
      DIAMOND: 6,
      MASTER: 7,
      GRANDMASTER: 8,
      CHALLENGER: 9,
    }

    return tiers[tier] || 0
  }

  // Implement LoL esports API methods
  async getTournaments(limit = 10): Promise<ApiResponse<GameTournament[]>> {
    try {
      // This would use the LoL Esports API
      // For now, returning mock data
      return {
        data: [
          {
            id: "lcs-summer-2023",
            name: "LCS Summer 2023",
            startDate: "2023-06-01T00:00:00Z",
            endDate: "2023-08-20T00:00:00Z",
            region: "NA",
            prizePool: "$200,000",
            teams: [
              {
                id: "team-liquid",
                name: "Team Liquid",
                logoUrl:
                  "https://am-a.akamaihd.net/image?resize=70:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1631819669150_tl-2021-worlds.png",
              },
              {
                id: "cloud9",
                name: "Cloud9",
                logoUrl:
                  "https://am-a.akamaihd.net/image?resize=70:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1631819614411_cloud9-2021-worlds.png",
              },
            ],
            gameSpecificData: {
              leagueId: "98767991299243165",
            },
          },
        ],
        error: null,
        status: 200,
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async getLiveMatches(limit = 5): Promise<ApiResponse<GameMatch[]>> {
    // This would use the LoL Esports API
    // For now, returning mock data
    return {
      data: [],
      error: null,
      status: 200,
    }
  }
}

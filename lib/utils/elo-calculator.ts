export class EloCalculator {
  // Default K-factor (determines how much ratings change after each match)
  private static readonly DEFAULT_K_FACTOR = 32

  /**
   * Calculates the expected outcome of a match based on player ratings
   * @param player1Rating Rating of player 1
   * @param player2Rating Rating of player 2
   * @returns Expected outcome (probability of player 1 winning)
   */
  static calculateExpectedOutcome(player1Rating: number, player2Rating: number): number {
    return 1 / (1 + Math.pow(10, (player2Rating - player1Rating) / 400))
  }

  /**
   * Calculates new ratings for both players after a match
   * @param player1Rating Current rating of player 1
   * @param player2Rating Current rating of player 2
   * @param actualOutcome Actual outcome (1 for player 1 win, 0 for player 2 win, 0.5 for draw)
   * @param kFactor K-factor to use (optional, defaults to 32)
   * @returns Object containing new ratings for both players
   */
  static calculateNewRatings(
    player1Rating: number,
    player2Rating: number,
    actualOutcome: number,
    kFactor: number = this.DEFAULT_K_FACTOR,
  ): { player1NewRating: number; player2NewRating: number } {
    // Calculate expected outcome
    const expectedOutcome = this.calculateExpectedOutcome(player1Rating, player2Rating)

    // Calculate rating changes
    const player1RatingChange = Math.round(kFactor * (actualOutcome - expectedOutcome))
    const player2RatingChange = Math.round(kFactor * (expectedOutcome - actualOutcome))

    // Calculate new ratings
    const player1NewRating = player1Rating + player1RatingChange
    const player2NewRating = player2Rating + player2RatingChange

    return { player1NewRating, player2NewRating }
  }

  /**
   * Gets the appropriate K-factor based on rating and number of games played
   * Higher rated players and players with more games have lower K-factors
   * @param rating Player's current rating
   * @param gamesPlayed Number of games the player has played
   * @returns Appropriate K-factor
   */
  static getKFactor(rating: number, gamesPlayed: number): number {
    // New players have higher K-factor
    if (gamesPlayed < 30) {
      return 40
    }

    // High-rated players have lower K-factor
    if (rating > 2400) {
      return 16
    }

    // Default K-factor
    return this.DEFAULT_K_FACTOR
  }

  /**
   * Gets the tier name for a given rating
   * @param rating Player's rating
   * @returns Tier name
   */
  static getTierName(rating: number): string {
    if (rating < 1000) return "Bronze"
    if (rating < 1200) return "Silver"
    if (rating < 1400) return "Gold"
    if (rating < 1600) return "Platinum"
    if (rating < 1800) return "Diamond"
    if (rating < 2000) return "Master"
    if (rating < 2200) return "Grandmaster"
    return "Champion"
  }
}

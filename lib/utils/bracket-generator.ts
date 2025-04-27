import { createClient } from "@/lib/supabase/client"

interface GenerateBracketOptions {
  tournamentId: string
  participantIds: string[] // Can be team_ids or profile_ids depending on tournament type
  isTeamTournament: boolean
  bracketType: "single_elimination" | "double_elimination"
}

export async function generateTournamentBracket({
  tournamentId,
  participantIds,
  isTeamTournament,
  bracketType = "single_elimination",
}: GenerateBracketOptions) {
  const supabase = createClient()

  try {
    // Shuffle participants for random seeding
    const shuffledParticipants = [...participantIds].sort(() => Math.random() - 0.5)

    // Calculate number of rounds needed
    const numParticipants = shuffledParticipants.length
    const numRounds = Math.ceil(Math.log2(numParticipants))
    const perfectBracketSize = Math.pow(2, numRounds)

    // Create first round matches with byes if needed
    const firstRoundMatches = []
    const matchesInFirstRound = perfectBracketSize / 2

    for (let i = 0; i < matchesInFirstRound; i++) {
      const participant1Index = i
      const participant2Index = perfectBracketSize - 1 - i

      const participant1 = participant1Index < numParticipants ? shuffledParticipants[participant1Index] : null
      const participant2 = participant2Index < numParticipants ? shuffledParticipants[participant2Index] : null

      // If both participants are null, we don't need this match
      if (!participant1 && !participant2) continue

      firstRoundMatches.push({
        participant1,
        participant2,
        matchNumber: i + 1,
        round: 1,
        bracketPosition: i,
      })
    }

    // Insert matches into database
    const matches = []

    // First, create all match structures (without next_match_id yet)
    for (let round = 1; round <= numRounds; round++) {
      const matchesInRound = Math.pow(2, numRounds - round)

      for (let i = 0; i < matchesInRound; i++) {
        // Only add first round matches that have at least one participant
        if (round === 1) {
          const firstRoundMatch = firstRoundMatches.find((m) => m.matchNumber === i + 1)
          if (!firstRoundMatch) continue

          const { data: match } = await supabase
            .from("matches")
            .insert({
              tournament_id: tournamentId,
              round,
              match_number: i + 1,
              bracket_position: i,
              status: "scheduled",
              start_time: null, // To be scheduled later
            })
            .select()
            .single()

          matches.push(match)

          // Add participants to the match
          if (firstRoundMatch.participant1) {
            await supabase.from("match_participants").insert({
              match_id: match.id,
              [isTeamTournament ? "team_id" : "profile_id"]: firstRoundMatch.participant1,
              score: null,
              result: null,
            })
          }

          if (firstRoundMatch.participant2) {
            await supabase.from("match_participants").insert({
              match_id: match.id,
              [isTeamTournament ? "team_id" : "profile_id"]: firstRoundMatch.participant2,
              score: null,
              result: null,
            })
          }

          // If only one participant, they automatically advance
          if (firstRoundMatch.participant1 && !firstRoundMatch.participant2) {
            await supabase
              .from("match_participants")
              .update({
                result: "win",
              })
              .eq("match_id", match.id)
              .eq(isTeamTournament ? "team_id" : "profile_id", firstRoundMatch.participant1)

            await supabase
              .from("matches")
              .update({
                status: "completed",
              })
              .eq("id", match.id)
          } else if (!firstRoundMatch.participant1 && firstRoundMatch.participant2) {
            await supabase
              .from("match_participants")
              .update({
                result: "win",
              })
              .eq("match_id", match.id)
              .eq(isTeamTournament ? "team_id" : "profile_id", firstRoundMatch.participant2)

            await supabase
              .from("matches")
              .update({
                status: "completed",
              })
              .eq("id", match.id)
          }
        } else {
          // Create later round matches
          const { data: match } = await supabase
            .from("matches")
            .insert({
              tournament_id: tournamentId,
              round,
              match_number: i + 1,
              bracket_position: i,
              status: "pending", // Waiting for previous matches to complete
              start_time: null, // To be scheduled later
            })
            .select()
            .single()

          matches.push(match)
        }
      }
    }

    // Now update next_match_id for all matches except the final
    for (let round = 1; round < numRounds; round++) {
      const matchesInRound = matches.filter((m) => m.round === round)

      for (let i = 0; i < matchesInRound.length; i++) {
        const currentMatch = matchesInRound[i]
        const nextRoundPosition = Math.floor(i / 2)
        const nextMatch = matches.find((m) => m.round === round + 1 && m.bracket_position === nextRoundPosition)

        if (nextMatch) {
          await supabase
            .from("matches")
            .update({
              next_match_id: nextMatch.id,
              next_match_position: i % 2 === 0 ? 1 : 2, // 1 for top position, 2 for bottom position
            })
            .eq("id", currentMatch.id)
        }
      }
    }

    // Update tournament status
    await supabase
      .from("tournaments")
      .update({
        status: "active",
        bracket_type: bracketType,
      })
      .eq("id", tournamentId)

    return { success: true }
  } catch (error) {
    console.error("Error generating bracket:", error)
    return { success: false, error }
  }
}

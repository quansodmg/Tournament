import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  try {
    const { data, error } = await supabase.from("teams").select("*").eq("id", params.id).single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching team:", error)
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  try {
    // Get the current session to verify the user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the team to check ownership
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("created_by")
      .eq("id", params.id)
      .single()

    if (teamError) {
      throw teamError
    }

    // Check if user is the team owner
    if (team.created_by !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: You don't have permission to update this team" }, { status: 403 })
    }

    // Parse the request body
    const updateData = await request.json()

    // Update the team
    const { data, error } = await supabase
      .from("teams")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error updating team:", error)
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 })
  }
}

import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()

  try {
    const { data, error } = await supabase.from("tournaments").select("*").eq("id", params.id).single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching tournament:", error)
    return NextResponse.json({ error: "Failed to fetch tournament" }, { status: 500 })
  }
}

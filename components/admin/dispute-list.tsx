"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Database,
  RefreshCw,
  Copy,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export default function DisputeList() {
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [tableExists, setTableExists] = useState(true)
  const [creatingTable, setCreatingTable] = useState(false)
  const [activeTab, setActiveTab] = useState("instructions")
  const supabase = createClientComponentClient()

  useEffect(() => {
    checkTableExists()
  }, [])

  async function checkTableExists() {
    setLoading(true)
    try {
      // Try to get the table definition from Supabase
      const { error } = await supabase.from("disputes").select("id").limit(1).single()

      // If there's an error with "does not exist" in the message, the table doesn't exist
      if (error && error.message.includes("does not exist")) {
        console.log("Disputes table doesn't exist")
        setTableExists(false)
        setLoading(false)
        return
      }

      // If we get here, the table exists, so fetch the disputes
      setTableExists(true)
      fetchDisputes()
    } catch (error) {
      console.error("Error checking if table exists:", error)
      // Assume table doesn't exist if there's an error
      setTableExists(false)
      setLoading(false)
    }
  }

  async function fetchDisputes() {
    if (!tableExists) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // First, fetch disputes without trying to use relationships
      let query = supabase.from("disputes").select("*").order("created_at", { ascending: false })

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }

      const { data: disputesData, error: disputesError } = await query

      if (disputesError) {
        console.error("Error fetching disputes:", disputesError)

        // Check if the error is because the table doesn't exist
        if (disputesError.message.includes("does not exist")) {
          setTableExists(false)
          setDisputes([])
          setLoading(false)
          return
        }

        setDisputes([])
        setLoading(false)
        return
      }

      setTableExists(true)

      // If we have disputes, fetch the related data separately
      if (disputesData && disputesData.length > 0) {
        // Get unique reporter IDs and match IDs
        const reporterIds = [...new Set(disputesData.filter((d) => d.reported_by_id).map((d) => d.reported_by_id))]
        const matchIds = [...new Set(disputesData.filter((d) => d.match_id).map((d) => d.match_id))]

        // Fetch profiles data
        let profilesData = {}
        if (reporterIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .in("id", reporterIds)

          if (profilesError) {
            console.error("Error fetching profiles:", profilesError)
          } else if (profiles) {
            // Convert to a lookup object
            profilesData = profiles.reduce((acc, profile) => {
              acc[profile.id] = profile
              return acc
            }, {})
          }
        }

        // Fetch matches data
        let matchesData = {}
        if (matchIds.length > 0) {
          const { data: matches, error: matchesError } = await supabase
            .from("matches")
            .select("id, start_time")
            .in("id", matchIds)

          if (matchesError) {
            console.error("Error fetching matches:", matchesError)
          } else if (matches) {
            // Convert to a lookup object
            matchesData = matches.reduce((acc, match) => {
              acc[match.id] = match
              return acc
            }, {})
          }
        }

        // Join the data manually
        const enrichedDisputes = disputesData.map((dispute) => ({
          ...dispute,
          reporter: dispute.reported_by_id ? profilesData[dispute.reported_by_id] : null,
          match: dispute.match_id ? matchesData[dispute.match_id] : null,
        }))

        setDisputes(enrichedDisputes)
      } else {
        setDisputes([])
      }
    } catch (error) {
      console.error("Exception fetching disputes:", error)
      setDisputes([])
    } finally {
      setLoading(false)
    }
  }

  const disputesTableSQL = `
-- Create disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    reported_by_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution_note TEXT,
    evidence_urls TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS disputes_match_id_idx ON public.disputes(match_id);
CREATE INDEX IF NOT EXISTS disputes_reported_by_id_idx ON public.disputes(reported_by_id);
CREATE INDEX IF NOT EXISTS disputes_assigned_to_id_idx ON public.disputes(assigned_to_id);
CREATE INDEX IF NOT EXISTS disputes_status_idx ON public.disputes(status);
CREATE INDEX IF NOT EXISTS disputes_created_at_idx ON public.disputes(created_at);

-- Add RLS policies
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own disputes
CREATE POLICY disputes_select_policy ON public.disputes
    FOR SELECT
    USING (
        auth.uid() = reported_by_id
        OR auth.uid() = assigned_to_id
        OR EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
    );

-- Policy for users to insert their own disputes
CREATE POLICY disputes_insert_policy ON public.disputes
    FOR INSERT
    WITH CHECK (auth.uid() = reported_by_id);

-- Policy for users to update their own disputes
CREATE POLICY disputes_update_policy ON public.disputes
    FOR UPDATE
    USING (
        auth.uid() = reported_by_id
        OR auth.uid() = assigned_to_id
        OR EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_disputes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_disputes_updated_at_trigger
BEFORE UPDATE ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION update_disputes_updated_at();

-- Add trigger to set resolved_at when status changes to 'resolved'
CREATE OR REPLACE FUNCTION update_disputes_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
        NEW.resolved_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_disputes_resolved_at_trigger
BEFORE UPDATE ON public.disputes
FOR EACH ROW
EXECUTE FUNCTION update_disputes_resolved_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.disputes TO authenticated;
GRANT SELECT ON public.disputes TO anon;
`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "SQL copied to clipboard",
      description: "You can now paste it into the Supabase SQL editor.",
    })
  }

  const filteredDisputes = disputes.filter(
    (dispute) =>
      dispute.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.reporter?.username?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Open
          </span>
        )
      case "resolved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Resolved
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        )
    }
  }

  if (!tableExists) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <h1 className="text-2xl font-bold">Dispute Management</h1>
        </div>

        <Card className="border-[#0bb5ff]/20 bg-[#101113]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Disputes Table Not Found
            </CardTitle>
            <CardDescription>
              The disputes table does not exist in your database. You need to create it before you can manage disputes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
                <TabsTrigger value="sql">SQL Script</TabsTrigger>
              </TabsList>
              <TabsContent value="instructions" className="mt-4">
                <div className="space-y-4">
                  <p className="text-sm text-gray-400">To create the disputes table, follow these steps:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
                    <li>Go to the Supabase dashboard for your project</li>
                    <li>Navigate to the SQL Editor section</li>
                    <li>Create a new query</li>
                    <li>Copy the SQL script from the "SQL Script" tab</li>
                    <li>Paste the script into the SQL Editor</li>
                    <li>Run the script</li>
                    <li>Return to this page and refresh</li>
                  </ol>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" onClick={() => setActiveTab("sql")} className="flex items-center gap-2">
                      View SQL Script
                    </Button>
                    <Button
                      onClick={() => window.open("https://app.supabase.com", "_blank")}
                      className="flex items-center gap-2 bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Supabase Dashboard
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="sql" className="mt-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Textarea
                      value={disputesTableSQL}
                      readOnly
                      className="h-[400px] font-mono text-xs bg-[#0A0B0D] p-4"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(disputesTableSQL)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setActiveTab("instructions")}>
                      Back to Instructions
                    </Button>
                    <Button
                      onClick={() => copyToClipboard(disputesTableSQL)}
                      className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy SQL Script
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={checkTableExists} className="bg-[#0bb5ff] hover:bg-[#0bb5ff]/80 text-white">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <h1 className="text-2xl font-bold">Dispute Management</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search disputes..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchDisputes}>
            <Filter className="h-4 w-4 mr-2" />
            Apply
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0bb5ff]"></div>
        </div>
      ) : filteredDisputes.length > 0 ? (
        <div className="bg-[#101113] border border-[#0bb5ff]/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#0A0B0D] text-[#0bb5ff]">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Reported By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Match</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0bb5ff]/10">
                {filteredDisputes.map((dispute) => (
                  <tr key={dispute.id} className="hover:bg-[#0bb5ff]/5">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{dispute.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium">{dispute.title}</div>
                      <div className="text-gray-500 truncate max-w-xs">{dispute.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(dispute.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{dispute.reporter?.username || "Unknown"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {dispute.match?.id ? (
                        <a href={`/matches/${dispute.match.id}`} className="text-[#0bb5ff] hover:underline">
                          Match #{dispute.match.id.substring(0, 8)}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(dispute.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a href={`/admin/disputes/${dispute.id}`} className="text-[#0bb5ff] hover:underline">
                        View Details
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#101113] border border-[#0bb5ff]/20 rounded-lg p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No disputes found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "There are no disputes to display at this time."}
          </p>
          {(searchQuery || statusFilter !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

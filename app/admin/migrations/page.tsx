import { Button } from "@/components/ui/button"
import Link from "next/link"
import fs from "fs"
import path from "path"

export default async function AdminMigrationsPage() {
  // Get list of migration files
  const migrationsDir = path.join(process.cwd(), "migrations")
  let migrationFiles = []

  try {
    migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort()
  } catch (err) {
    console.error("Error reading migrations directory:", err)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Database Migrations</h1>

      <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h2 className="text-lg font-medium">Available Migrations</h2>
        </div>
        <ul className="divide-y">
          {migrationFiles.map((file) => (
            <li key={file} className="p-4 flex justify-between items-center">
              <span className="font-mono text-sm">{file}</span>
              <Link href={`/api/admin/run-migration?file=${encodeURIComponent(file)}`} prefetch={false}>
                <Button variant="outline" size="sm">
                  Run Migration
                </Button>
              </Link>
            </li>
          ))}
          {migrationFiles.length === 0 && <li className="p-4 text-gray-500 italic">No migration files found</li>}
        </ul>
      </div>

      <div className="mt-6">
        <Link href="/admin/cron">
          <Button variant="outline">Back to Cron Monitor</Button>
        </Link>
      </div>
    </div>
  )
}

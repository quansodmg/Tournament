import Link from "next/link"

export default function Header() {
  return (
    <header className="bg-background py-4 px-6 shadow-md">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-primary">
          EsportsHub
        </Link>
        <ul className="flex space-x-6">
          <li>
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link href="/games" className="text-foreground hover:text-primary transition-colors">
              Games
            </Link>
          </li>
          <li>
            <Link href="/match-finder" className="text-foreground hover:text-primary transition-colors">
              Match Finder
            </Link>
          </li>
          <li>
            <Link href="/tournaments" className="text-foreground hover:text-primary transition-colors">
              Tournaments
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}

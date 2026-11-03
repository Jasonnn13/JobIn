import Link from "next/link";

const LINKS = [
  { href: "/jobs", label: "Jobs" },
  { href: "/courses", label: "Courses" },
  { href: "/profile", label: "Profile" },
  { href: "/about", label: "About us" },
];

const Footer = () => {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <span className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="size-6" />
            <span className="text-lg font-semibold tracking-tight">JobIn</span>
          </span>
          <p className="mt-2 text-sm text-muted-foreground">Jobs and training for blue-collar workers. © 2025</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted-foreground hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;

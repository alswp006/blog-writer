import Link from "next/link";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  columns?: FooterColumn[];
  copyright?: string;
}

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "App";

export function Footer({ columns, copyright }: FooterProps) {
  const defaultColumns: FooterColumn[] = [
    {
      title: "Product",
      links: [
        { label: "Pricing", href: "/pricing" },
        { label: "Dashboard", href: "/dashboard" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Sign Up", href: "/signup" },
        { label: "Login", href: "/login" },
      ],
    },
  ];

  const cols = columns || defaultColumns;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] mt-16 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        {cols.map((col) => (
          <div key={col.title} className="space-y-3">
            <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              {col.title}
            </h4>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] no-underline hover:text-[var(--text)] transition-all duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="text-xs text-[var(--text-muted)]">
        {copyright || `\u00A9 ${year} ${siteName}. All rights reserved.`}
      </div>
    </footer>
  );
}

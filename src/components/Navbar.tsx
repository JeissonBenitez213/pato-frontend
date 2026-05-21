"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";
import {
  UserIcon,
  SettingsIcon,
  HomeIcon,
  SearchIcon,
  PlusIcon,
} from "./Icons";

const items = [
  { href: "/profile", label: "User", Icon: UserIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
  { href: "/feed", label: "Home", Icon: HomeIcon },
  { href: "/search", label: "Search", Icon: SearchIcon },
  { href: "/post", label: "Postear", Icon: PlusIcon },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.wrap} aria-label="Navegacion principal">
      <div className={styles.bar}>
        {items.map(({ href, label, Icon }) => {
          const active =
            href === "/feed"
              ? pathname === "/feed" || pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.item} ${active ? styles.active : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className={styles.label}>{label}</span>
              <Icon />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

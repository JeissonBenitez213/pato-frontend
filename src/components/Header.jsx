"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CiUser,
  CiSettings,
  CiHome,
  CiSearch,
  CiCirclePlus,
} from "react-icons/ci";

function Header() {
  const [navLinks, setNavLinks] = useState([
    { href: "/User", label: <CiUser /> },
    { href: "/Settings", label: <CiSettings /> },
    { href: "/", label: <CiHome /> },
    { href: "/Search", label: <CiSearch /> },
    { href: "/Postear", label: <CiCirclePlus /> },
  ]);

  const pathname = usePathname();

  useEffect(() => {
    const currentIndex = navLinks.findIndex((e) => e.href === pathname);
    const targetPosition = 2;

    if (currentIndex === -1) return;

    const rotateBy =
      (currentIndex - targetPosition + navLinks.length) % navLinks.length;

    const rotated = [
      ...navLinks.slice(rotateBy),
      ...navLinks.slice(0, rotateBy),
    ];

    setNavLinks(rotated);
  }, [pathname]);

  return (
    <header className="bg-secondary w-[150vw] h-48 fixed top-0 -translate-y-2/5 left-1/2 -translate-x-1/2 flex justify-center items-center rounded-[100%] border-acent border-8 overflow-hidden">
      <motion.nav
        layout
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="w-[101.6vw] h-full flex"
      >
        {navLinks.map((e) => (
          <motion.div key={e.href} layout className="flex-[0_0_20%]">
            <Link
              href={e.href}
              className="flex items-center justify-center h-[110%] text-5xl border-4 border-acent"
            >
              {e.label}
            </Link>
          </motion.div>
        ))}
      </motion.nav>
    </header>
  );
}

export default Header;

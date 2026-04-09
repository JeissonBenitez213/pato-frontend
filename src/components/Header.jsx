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

  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();

  // 🔁 Reordenar nav según ruta actual
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

  // 📜 Detectar dirección del scroll
  useEffect(() => {
    let lastScroll = window.scrollY;
    const threshold = 10;

    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll - lastScroll > threshold && currentScroll > 50) {
        // Scroll hacia abajo
        setHidden(true);
      } else if (lastScroll - currentScroll > threshold) {
        // Scroll hacia arriba
        setHidden(false);
      }

      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: hidden ? -200 : -80 }} // ajusta -80 según tu diseño
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-secondary w-[150vw] h-48 fixed top-0 left-1/2 -translate-x-1/2 flex justify-center items-center rounded-[100%] border-acent border-8 overflow-hidden z-50"
    >
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
    </motion.header>
  );
}

export default Header;

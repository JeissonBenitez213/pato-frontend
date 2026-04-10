"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import {
  CiUser,
  CiSettings,
  CiHome,
  CiSearch,
  CiCirclePlus,
} from "react-icons/ci";

const ITEM_PERCENT = 20;

function Header() {
  const router = useRouter();
  const controls = useAnimation();

  const [navLinks, setNavLinks] = useState([
    { href: "/User", label: <CiUser /> },
    { href: "/Settings", label: <CiSettings /> },
    { href: "/", label: <CiHome /> },
    { href: "/Search", label: <CiSearch /> },
    { href: "/Postear", label: <CiCirclePlus /> },
  ]);

  const [hidden, setHidden] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const pathname = usePathname();
  const centerIndex = 2;

  useEffect(() => {
    const currentIndex = navLinks.findIndex((e) => e.href === pathname);
    if (currentIndex === -1) return;

    const rotateBy =
      (currentIndex - centerIndex + navLinks.length) % navLinks.length;

    const rotated = [
      ...navLinks.slice(rotateBy),
      ...navLinks.slice(0, rotateBy),
    ];

    setNavLinks(rotated);
    controls.set({ x: "0%" });
  }, [pathname]);

  useEffect(() => {
    let lastScroll = window.scrollY;
    const threshold = 10;

    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll - lastScroll > threshold && currentScroll > 50) {
        setHidden(true);
      } else if (lastScroll - currentScroll > threshold) {
        setHidden(false);
      }

      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = async (index, href) => {
    if (isAnimating) return;

    const diff = index - centerIndex;
    if (diff === 0) {
      router.push(href);
      return;
    }

    setIsAnimating(true);

    const direction = diff > 0 ? -1 : 1;
    const distance = Math.abs(diff) * ITEM_PERCENT * direction;

    await controls.start({
      x: `${distance}%`,
      transition: { duration: 0.4, ease: "easeInOut" },
    });

    const rotateBy = (index - centerIndex + navLinks.length) % navLinks.length;

    const rotated = [
      ...navLinks.slice(rotateBy),
      ...navLinks.slice(0, rotateBy),
    ];

    setNavLinks(rotated);

    controls.set({ x: "0%" });

    router.push(href);
    setIsAnimating(false);
  };

  const extended = [...navLinks, ...navLinks, ...navLinks];

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: hidden ? -200 : -80 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-secondary w-[150vw] h-48 fixed top-0 left-1/2 -translate-x-1/2 flex justify-center items-center rounded-[100%] border-acent border-8 overflow-hidden z-50"
    >
      <motion.nav
        animate={controls}
        className="w-[101.6vw] h-full flex justify-center"
      >
        {extended.map((e, i) => {
          const realIndex = i % navLinks.length;

          return (
            <div key={i} className="flex-[0_0_20%]">
              <button
                onClick={() => handleClick(realIndex, e.href)}
                className="w-full h-[125%] flex items-center justify-center text-5xl border-4 border-acent"
              >
                {e.label}
              </button>
            </div>
          );
        })}
      </motion.nav>
    </motion.header>
  );
}

export default Header;

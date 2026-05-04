"use client";

import { useState, useEffect } from "react";
import { featureFlags } from "@/lib/feature-flags";

const allNavItems = [
  { id: "profile", label: "Profile Context" },
  ...(featureFlags.showApiKeys ? [{ id: "api", label: "API Authentication" }] : []),
  { id: "usage", label: "Resource Usage & Plan" },
  { id: "preferences", label: "Global Preferences" },
];

export function SettingsSidebarNav() {
  const [activeId, setActiveId] = useState("profile");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
    );

    allNavItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky top-20 hidden h-fit space-y-1 lg:block">
      {allNavItems.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          className={
            activeId === id
              ? "block rounded border-l-2 border-[#22C55E] bg-[#111827] px-3 py-2 text-sm font-medium text-white"
              : "block rounded px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-[#1F2937] hover:text-white"
          }
        >
          {label}
        </a>
      ))}
    </div>
  );
}

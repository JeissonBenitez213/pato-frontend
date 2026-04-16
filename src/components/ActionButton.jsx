"use client";

export default function ActionButton({ icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-2xl border border-white/10 bg-[var(--color-surface)] px-4 py-2 text-sm text-text-base transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
        active ? "border-[var(--color-accent)] bg-[rgba(122,109,243,0.15)] text-[var(--color-accent)]" : "hover:border-white/20 hover:bg-white/5"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

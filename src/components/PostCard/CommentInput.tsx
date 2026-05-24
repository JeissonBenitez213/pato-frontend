"use client";

import type { KeyboardEventHandler } from "react";

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  buttonLabel?: string;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}

export default function CommentInput({
  value,
  onChange,
  onSubmit,
  placeholder = "comentar...",
  buttonLabel = "enviar",
  onKeyDown,
}: CommentInputProps) {
  return (
    <div className="mt-3 flex gap-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className="
          flex-1
          bg-black/60
          px-3
          py-2
          rounded-full
        "
        placeholder={placeholder}
      />

      <button
        className="
          bg-green-600
          px-4
          rounded-full
        "
        onClick={onSubmit}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

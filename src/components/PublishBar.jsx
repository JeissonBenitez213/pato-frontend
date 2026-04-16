"use client";

import { useState } from "react";
import { FiImage, FiPaperclip } from "react-icons/fi";

/**
 * @typedef {Object} PublishBarProps
 * @property {"home"|"profile"} variant
 * @property {(value:string) => void} onPublish
 */

/**
 * Barra de publicación reutilizable para home y perfil.
 * @param {PublishBarProps} props
 */
export default function PublishBar({ variant = "home", onPublish }) {
  const [value, setValue] = useState("");
  const [attachedImageName, setAttachedImageName] = useState("");
  const [attachedFileName, setAttachedFileName] = useState("");
  const limit = 220;

  const handlePublish = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onPublish(trimmed);
    setValue("");
    setAttachedImageName("");
    setAttachedFileName("");
  };

  const handleImageSelect = (event) => {
    setAttachedImageName(event.target.files?.[0]?.name ?? "");
  };

  const handleFileSelect = (event) => {
    setAttachedFileName(event.target.files?.[0]?.name ?? "");
  };

  if (variant === "profile") {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-[var(--color-surface)] p-5 shadow-lg">
        <div className="mb-4 flex items-center justify-between rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm text-white/80">
          <span className="font-semibold text-text-base">Escribir algo</span>
          <span className="text-xs text-white/50">{value.length}/{limit}</span>
        </div>
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value.slice(0, limit))}
          placeholder="Comparte una actualización desde tu perfil..."
          className="min-h-[120px] w-full resize-none rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 text-sm text-white outline-none transition focus:border-[var(--color-accent)]"
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20 hover:bg-white/10">
              <FiImage />
              <span>Imagen</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20 hover:bg-white/10">
              <FiPaperclip />
              <span>Archivo</span>
              <input type="file" className="hidden" onChange={handleFileSelect} />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50">{value.length}/{limit}</span>
            <button
              type="button"
              onClick={handlePublish}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(122,109,243,0.25)] transition hover:bg-[rgba(122,109,243,0.95)]"
            >
              Publicar
            </button>
          </div>
        </div>
        {(attachedImageName || attachedFileName) && (
          <div className="mt-3 space-y-1 text-xs text-white/70">
            {attachedImageName ? <p>Imagen: {attachedImageName}</p> : null}
            {attachedFileName ? <p>Archivo: {attachedFileName}</p> : null}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-[var(--color-surface)] p-4 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.7)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm text-white/80">
          <label className="sr-only" htmlFor="homePostInput">
            Escribe algo
          </label>
          <textarea
            id="homePostInput"
            value={value}
            onChange={(event) => setValue(event.target.value.slice(0, limit))}
            placeholder="Escribe algo..."
            className="w-full resize-none bg-transparent text-sm text-white outline-none"
            rows="2"
            maxLength={limit}
          />
        </div>
        <button
          type="button"
          onClick={handlePublish}
          className="inline-flex min-w-[140px] items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[rgba(122,109,243,0.95)]"
        >
          Publicar
        </button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/70">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20 hover:bg-white/10">
          <FiImage />
          <span>Imagen</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:border-white/20 hover:bg-white/10">
          <FiPaperclip />
          <span>Archivo</span>
          <input type="file" className="hidden" onChange={handleFileSelect} />
        </label>
        {(attachedImageName || attachedFileName) && (
          <div className="ml-auto space-y-1 text-xs text-white/70">
            {attachedImageName ? <p>Imagen: {attachedImageName}</p> : null}
            {attachedFileName ? <p>Archivo: {attachedFileName}</p> : null}
          </div>
        )}
      </div>
      <p className="mt-3 text-right text-xs text-white/50">Máximo {limit} caracteres</p>
    </div>
  );
}

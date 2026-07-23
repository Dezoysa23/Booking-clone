"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/cn";

/**
 * next/image with a graceful branded fallback. If the source 404s / fails to
 * optimize (e.g. an orphaned upload reference), we render an on-brand navy tile
 * with a photo glyph instead of a broken-image icon. Designed for `fill` usage.
 */
export function SafeImage({
  className,
  alt,
  fill,
  ...props
}: ImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        role="img"
        aria-label={typeof alt === "string" ? alt : "Image unavailable"}
        className={cn(
          "section-navy flex items-center justify-center",
          fill ? "absolute inset-0" : className,
        )}
      >
        <span
          className="material-symbols-outlined text-4xl text-[#e8c892]/70"
          aria-hidden="true"
        >
          photo_camera
        </span>
      </span>
    );
  }

  return (
    <Image
      alt={alt}
      fill={fill}
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}

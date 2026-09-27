"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A cover image that cross-fades between multiple images every few seconds.
 * With a single image it renders statically. Used on project cards so
 * multi-image projects get a subtle time-based swap (3–5s).
 */
export function SwappingCover({
  images,
  alt,
  intervalMs = 4000,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: {
  images: string[];
  alt: string;
  intervalMs?: number;
  className?: string;
  sizes?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  if (images.length === 0) {
    return (
      <div className="blueprint-grid grid h-full w-full place-items-center">
        <span className="tech-label">No preview</span>
      </div>
    );
  }

  return (
    <>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={cn(
            "object-cover transition-opacity duration-1000 ease-in-out",
            i === index ? "opacity-100" : "opacity-0",
            className,
          )}
          priority={i === 0}
        />
      ))}
    </>
  );
}

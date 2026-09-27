"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Profile portrait that cross-fades between headshots (if more than one). */
export function ProfilePortrait({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="blueprint-grid grid aspect-[4/5] w-full place-items-center border border-steel-800">
        <span className="tech-label">Profile photo</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden border border-steel-800 bg-ink-900">
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 300px"
          priority={i === 0}
          className={cn(
            "object-cover transition-opacity duration-1000 ease-in-out",
            i === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </div>
  );
}

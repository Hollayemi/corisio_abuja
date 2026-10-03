"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[36px] bg-neutral-50">
        <Image
          src={images[active]}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 490px, 100vw"
          className="object-contain p-4"
        />
      </div>

      {images.length > 1 && (
        <ul className="mt-5 flex flex-wrap gap-4">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-pressed={i === active}
                className={`relative block size-24 overflow-hidden rounded-2xl bg-neutral-50 ring-2 transition sm:size-[130px] ${
                  i === active
                    ? "ring-corisio-blue"
                    : "ring-transparent hover:ring-neutral-300"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="130px"
                  className="object-contain p-1.5"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

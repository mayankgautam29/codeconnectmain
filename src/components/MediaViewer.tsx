"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Film } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type MediaViewerProps = {
  urls: string[];
  alt?: string;
  variant?: "feed" | "grid" | "compact";
  className?: string;
};

function isVideo(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

export function MediaViewer({
  urls,
  alt = "Post media",
  variant = "feed",
  className,
}: MediaViewerProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  if (!urls.length) return null;

  const containerClass = cn(
    "relative w-full overflow-hidden bg-[#060a12]/80",
    variant === "feed" && "min-h-[220px] max-h-[min(72vh,580px)] rounded-2xl",
    variant === "grid" && "aspect-[4/3] rounded-xl",
    variant === "compact" && "aspect-square rounded-lg",
    className
  );

  const mediaClass = cn(
    "w-full h-full",
    variant === "feed" ? "object-contain max-h-[min(72vh,580px)]" : "object-contain"
  );

  const renderMedia = (url: string, idx: number) => {
    if (isVideo(url)) {
      return (
        <video
          key={idx}
          className={cn(mediaClass, "bg-black")}
          controls
          playsInline
          preload="metadata"
        >
          <source src={url} type="video/mp4" />
        </video>
      );
    }

    if (variant === "feed") {
      return (
        <div key={idx} className="relative w-full flex items-center justify-center min-h-[220px] max-h-[min(72vh,580px)]">
          <Image
            src={url}
            alt={`${alt} ${idx + 1}`}
            width={1200}
            height={800}
            className={mediaClass}
            sizes="(max-width: 768px) 100vw, 672px"
            priority={idx === 0}
          />
        </div>
      );
    }

    return (
      <div key={idx} className="relative w-full h-full flex items-center justify-center p-1">
        <Image
          src={url}
          alt={`${alt} ${idx + 1}`}
          fill
          className="object-contain"
          sizes={variant === "grid" ? "50vw" : "25vw"}
        />
      </div>
    );
  };

  if (urls.length === 1) {
    return (
      <div className={containerClass}>
        {isVideo(urls[0]) ? (
          renderMedia(urls[0], 0)
        ) : (
          <div className="relative w-full flex items-center justify-center min-h-[inherit]">
            {renderMedia(urls[0], 0)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(containerClass, "group")}>
      <Carousel setApi={setApi} className="w-full h-full">
        <CarouselContent className="ml-0">
          {urls.map((url, idx) => (
            <CarouselItem key={idx} className="pl-0 basis-full">
              <div
                className={cn(
                  "relative flex items-center justify-center",
                  variant === "feed" ? "min-h-[220px] max-h-[min(72vh,580px)]" : "h-full min-h-[180px]"
                )}
              >
                {isVideo(url) ? (
                  <video className={cn(mediaClass, "bg-black")} controls playsInline>
                    <source src={url} type="video/mp4" />
                  </video>
                ) : variant === "feed" ? (
                  renderMedia(url, idx)
                ) : (
                  <div className="relative w-full h-full min-h-[180px]">{renderMedia(url, idx)}</div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 border-white/15 text-white hover:bg-black/70 size-9" />
        <CarouselNext className="right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 border-white/15 text-white hover:bg-black/70 size-9" />
      </Carousel>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {urls.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Slide ${idx + 1}`}
            onClick={() => api?.scrollTo(idx)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              idx === current ? "w-5 bg-cyan-300" : "w-1.5 bg-white/35 hover:bg-white/55"
            )}
          />
        ))}
      </div>
      {urls.some(isVideo) && (
        <span className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[10px] text-white/80 backdrop-blur-sm">
          <Film size={12} />
          {current + 1}/{urls.length}
        </span>
      )}
    </div>
  );
}

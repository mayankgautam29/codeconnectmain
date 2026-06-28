"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { formatRelativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";

export interface PostData {
  _id?: string;
  imageUrl: string[];
  caption: string;
  createdAt?: string | Date;
  likes?: number;
  liked?: boolean;
  user: {
    userId: string;
    username: string;
    profileImg: string;
  };
}

type PostCardProps = {
  post: PostData;
  currentUserId: string;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function PostCard({ post, currentUserId, onLike, onDelete }: PostCardProps) {
  const isOwner = post._id && post.user.userId === currentUserId;

  return (
    <article className="max-w-2xl mx-auto rounded-[1.6rem] overflow-hidden border border-white/10 bg-white/[0.045] backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.45)] transition-all duration-300 hover:border-cyan-300/30">
      <div className="p-5 md:p-6 space-y-5 md:space-y-6">
        <div className="flex items-center justify-between">
          <Link href={`/profile/${post.user.userId}`}>
            <div className="flex items-center gap-3 hover:opacity-90 transition">
              <Image
                src={post.user.profileImg}
                alt={post.user.username}
                width={46}
                height={46}
                className="rounded-full border border-white/20 shadow-[0_10px_24px_rgba(0,0,0,0.3)]"
              />
              <div>
                <p className="text-base md:text-lg font-semibold text-white">
                  {post.user.username}
                </p>
                <p className="text-xs text-white/55">
                  {post.createdAt ? formatRelativeTime(post.createdAt) : "Creator"}
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-inner">
          <Carousel className="w-full h-full">
            <CarouselContent className="h-full">
              {post.imageUrl.map((url, idx) => (
                <CarouselItem key={idx} className="w-full h-[300px] relative">
                  {url.endsWith(".mp4") ? (
                    <video className="w-full h-full object-cover rounded-2xl" controls>
                      <source src={url} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="relative w-full h-full">
                      <Image
                        src={url}
                        alt={`media-${idx}`}
                        fill
                        sizes="100%"
                        className="object-cover rounded-2xl"
                      />
                    </div>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            {post.imageUrl.length > 1 && (
              <>
                <CarouselPrevious className="absolute top-1/2 -translate-y-1/2 left-3 z-10 bg-black/35 border-white/15 text-white hover:bg-black/60" />
                <CarouselNext className="absolute top-1/2 -translate-y-1/2 right-3 z-10 bg-black/35 border-white/15 text-white hover:bg-black/60" />
              </>
            )}
          </Carousel>
        </div>

        {post.caption && (
          <p className="text-sm text-white/80 leading-relaxed">
            <span className="font-semibold text-white">{post.user.username}</span>{" "}
            {post.caption}
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => post._id && onLike(post._id)}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition",
              post.liked ? "text-fuchsia-300" : "text-white/70 hover:text-cyan-200"
            )}
          >
            <Heart
              size={18}
              className={cn(post.liked && "fill-fuchsia-400 text-fuchsia-400")}
            />
            {post.likes ?? 0}
          </button>

          {isOwner && onDelete && post._id && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-full"
              onClick={() => onDelete(post._id!)}
            >
              <Trash2 size={16} className="mr-1.5" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

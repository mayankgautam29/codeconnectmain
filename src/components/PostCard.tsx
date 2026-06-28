"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/time";
import { cn } from "@/lib/utils";
import { MediaViewer } from "@/components/MediaViewer";

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
    <article className="glass-card max-w-xl mx-auto overflow-hidden transition-all duration-300 hover:border-cyan-400/20 hover:shadow-[0_28px_70px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 md:px-5 border-b border-white/[0.06]">
        <Link href={`/profile/${post.user.userId}`} className="flex items-center gap-3 min-w-0 group">
          <div className="relative shrink-0">
            <Image
              src={post.user.profileImg}
              alt={post.user.username}
              width={42}
              height={42}
              className="rounded-full border-2 border-white/15 ring-2 ring-cyan-400/10 object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate group-hover:text-cyan-100 transition">
              {post.user.username}
            </p>
            <p className="text-[11px] text-white/45">
              {post.createdAt ? formatRelativeTime(post.createdAt) : "Builder"}
            </p>
          </div>
        </Link>
      </div>

      {/* Media — edge-to-edge, images fit naturally */}
      <div className="border-y border-white/[0.04]">
        <MediaViewer urls={post.imageUrl} alt={post.caption || post.user.username} variant="feed" />
      </div>

      {/* Actions */}
      <div className="px-4 py-3 md:px-5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => post._id && onLike(post._id)}
              className={cn(
                "flex items-center justify-center size-10 rounded-xl transition-all",
                post.liked
                  ? "text-rose-400 bg-rose-500/10 hover:bg-rose-500/15"
                  : "text-white/70 hover:text-rose-300 hover:bg-white/[0.05]"
              )}
              aria-label={post.liked ? "Unlike" : "Like"}
            >
              <Heart size={20} className={cn(post.liked && "fill-rose-400")} />
            </button>
            <Link
              href={`/profile/${post.user.userId}`}
              className="flex items-center justify-center size-10 rounded-xl text-white/70 hover:text-cyan-200 hover:bg-white/[0.05] transition"
              aria-label="View profile"
            >
              <MessageCircle size={20} />
            </Link>
          </div>

          {isOwner && onDelete && post._id && (
            <button
              onClick={() => onDelete(post._id!)}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-rose-400 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>

        {(post.likes ?? 0) > 0 && (
          <p className="text-sm font-semibold text-white">
            {post.likes} {post.likes === 1 ? "like" : "likes"}
          </p>
        )}

        {post.caption && (
          <p className="text-sm text-white/85 leading-relaxed">
            <Link
              href={`/profile/${post.user.userId}`}
              className="font-semibold text-white hover:text-cyan-100 mr-1.5"
            >
              {post.user.username}
            </Link>
            {post.caption}
          </p>
        )}
      </div>
    </article>
  );
}

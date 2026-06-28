"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PostCard, type PostData } from "@/components/PostCard";
import { FeedSkeleton } from "@/components/FeedSkeleton";
import { StatsBar } from "@/components/StatsBar";
import { Button } from "@/components/ui/button";
import { Flame, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type SortMode = "newest" | "likes";

export default function HomePage() {
  const [data, setData] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userId, setUserId] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sort, setSort] = useState<SortMode>("newest");
  const router = useRouter();

  const fetchPosts = useCallback(
    async (pageNum: number, sortMode: SortMode, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else setLoading(true);

        const res = await axios.post("/api/main", { page: pageNum, sort: sortMode });
        const posts: PostData[] = res.data.posts || [];

        setData((prev) => (append ? [...prev, ...posts] : posts));
        setUserId(res.data.usrId || "");
        setHasMore(res.data.hasMore ?? false);
        setPage(pageNum);
      } catch (err) {
        console.error("Error fetching posts:", err);
        if (!append) setData([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPosts(1, sort);
  }, [sort, fetchPosts]);

  const handleDelete = async (id: string) => {
    const res = await fetch("/api/deletepost", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setData((prev) => prev.filter((post) => post._id !== id));
    }
  };

  const handleLike = async (id: string) => {
    if (!userId) return router.push("/sign-in");

    const res = await fetch("/api/postlike", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const result = await res.json();
    if (!res.ok) return console.error(result.error);

    setData((prev) =>
      prev.map((post) =>
        post._id === id
          ? { ...post, likes: result.updatedLikes, liked: result.liked }
          : post
      )
    );
  };

  const handleRefresh = () => fetchPosts(1, sort);
  const handleLoadMore = () => fetchPosts(page + 1, sort, true);

  return (
    <div className="max-w-6xl mx-auto">
      <StatsBar />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 max-w-2xl mx-auto">
        <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-1">
          <button
            onClick={() => setSort("newest")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition",
              sort === "newest"
                ? "bg-cyan-400/20 text-cyan-100 border border-cyan-300/30"
                : "text-white/60 hover:text-white"
            )}
          >
            <Clock size={14} />
            Latest
          </button>
          <button
            onClick={() => setSort("likes")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition",
              sort === "likes"
                ? "bg-fuchsia-400/20 text-fuchsia-100 border border-fuchsia-300/30"
                : "text-white/60 hover:text-white"
            )}
          >
            <Flame size={14} />
            Trending
          </button>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm text-white/60 hover:text-cyan-200 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <FeedSkeleton />
      ) : data.length > 0 ? (
        <div className="space-y-8 md:space-y-10">
          {data.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUserId={userId}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          ))}

          {hasMore && (
            <div className="text-center pt-4">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="rounded-full px-8 bg-white/10 hover:bg-white/15 border border-white/15 text-white"
              >
                {loadingMore ? "Loading..." : "Load more posts"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 max-w-md mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 backdrop-blur-md">
            <p className="text-2xl font-semibold text-white mb-2">No posts yet</p>
            <p className="text-white/50 text-sm mb-6">
              Be the first to share your work with the community.
            </p>
            <Button
              onClick={() => router.push("/create-post")}
              className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110"
            >
              Create your first post
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

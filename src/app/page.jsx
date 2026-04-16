"use client";

import { useState } from "react";
import PublishBar from "@/components/PublishBar";
import PostCard from "@/components/PostCard";
import { mockPosts } from "@/components/mockPosts";

export default function HomePage() {
  const [posts, setPosts] = useState(mockPosts);

  const handleNewPost = (text) => {
    const newPost = {
      id: `${Date.now()}`,
      authorName: "Tu perfil",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      contentImage: "",
      caption: text,
      timestamp: "Ahora mismo",
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
    };

    setPosts((current) => [newPost, ...current]);
  };

  return (
    <main className="min-h-screen bg-[var(--color-primary)] px-4 pt-40 pb-10 text-text-base">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-text-base">Inicio</h1>
        </div>

        <div className="space-y-6">
          <PublishBar variant="home" onPublish={handleNewPost} />
        </div>

        <section className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      </section>
    </main>
  );
}

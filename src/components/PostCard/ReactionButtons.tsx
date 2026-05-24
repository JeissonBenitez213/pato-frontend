"use client";

import {
  FaHeart,
  FaRegHeart,
  FaRegStar,
  FaStar,
  FaRegComment,
  FaShare,
} from "react-icons/fa";

interface ReactionButtonsProps {
  likes: number;
  favorites: number;
  shares: number;
  commentsCount: number;
  liked: boolean;
  favorited: boolean;
  showComments: boolean;
  onToggleLike: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
  onToggleComments: () => void;
}

export default function ReactionButtons({
  likes,
  favorites,
  shares,
  commentsCount,
  liked,
  favorited,
  showComments,
  onToggleLike,
  onToggleFavorite,
  onShare,
  onToggleComments,
}: ReactionButtonsProps) {
  return (
    <div className="mt-4 flex gap-5 text-lg">
      <button onClick={onToggleLike} className="flex items-center gap-2">
        {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
        <span className="text-sm">{likes}</span>
      </button>

      <button onClick={onToggleComments} className="flex items-center gap-2">
        <FaRegComment />
        <span className="text-sm">{commentsCount}</span>
      </button>

      <button onClick={onShare} className="flex items-center gap-2">
        <FaShare />
        <span className="text-sm">{shares}</span>
      </button>

      <button onClick={onToggleFavorite} className="flex items-center gap-2">
        {favorited ? <FaStar className="text-yellow-400" /> : <FaRegStar />}
        <span className="text-sm">{favorites}</span>
      </button>
    </div>
  );
}

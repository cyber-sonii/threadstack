"use client";

import { useState } from "react";
import ReplyForm from "@/app/components/ReplyForm";
import DeleteButton from "@/app/components/DeleteButton";
import VoteButton from "@/app/components/VoteButton";

export default function ReplyTree({
  replies,
  postId,
  user,
  isAdmin,
  replyUserVotes = {},
  depth = 0,
}) {
  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <ReplyNode
          key={reply.id}
          reply={reply}
          postId={postId}
          user={user}
          isAdmin={isAdmin}
          replyUserVotes={replyUserVotes}
          depth={depth}
        />
      ))}
    </div>
  );
}

function ReplyNode({
  reply,
  postId,
  user,
  isAdmin,
  replyUserVotes,
  depth,
}) {
  // local toggle state lets each reply open its own nested reply form independently.
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <div
      className="bg-white p-4 rounded shadow-sm"
      style={{ marginLeft: `${depth * 24}px` }}
    >
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span>{reply.author_name}</span>
        <span>{reply.created_at}</span>
      </div>

      <p>{reply.body}</p>

      {/* Voting for each reply */}
      <div className="mt-2">
        <VoteButton
          targetType="reply"
          targetId={reply.id}
          initialScore={reply.score || 0}
          initialUserVote={replyUserVotes[reply.id] || 0}
          canVote={!!user}
        />
      </div>

      {/* reply-to-reply button */}
      {/* this is what lets users reply to an existing reply instead of only the post. */}
      <div className="flex gap-4 mt-3 items-center">
        {user && (
          <button
            type="button"
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showReplyForm ? "Cancel" : "Reply"}
          </button>
        )}

        {isAdmin && (
          <DeleteButton
            endpoint={`/api/replies/${reply.id}`}
            label="Reply"
            redirect={`/posts/${postId}`}
          />
        )}
      </div>

      {/* nested reply form */}
      {/* when replying to a reply, we need to send parentReplyId = current reply id. */}
      {showReplyForm && user && (
        <ReplyForm
          postId={postId}
          parentReplyId={reply.id}
          placeholder="Write a nested reply..."
          buttonLabel="Reply to Reply"
          onSuccess={() => setShowReplyForm(false)}
        />
      )}

      {/* recursive render of child replies */}
      {/* this is what makes nesting unlimited depth. */}
      {reply.children && reply.children.length > 0 && (
        <div className="mt-4">
          <ReplyTree
            replies={reply.children}
            postId={postId}
            user={user}
            isAdmin={isAdmin}
            replyUserVotes={replyUserVotes}
            depth={depth + 1}
          />
        </div>
      )}
    </div>
  );
}
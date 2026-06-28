//Single posts page
// Shows one post and all replies that belong to it

import { getDB } from "@/db/db";
import ReplyForm from "@/app/components/ReplyForm";
import ReplyTree from "@/app/components/ReplyTree";
import DeleteButton from "@/app/components/DeleteButton";
import VoteButton from "@/app/components/VoteButton";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";

export default async function SinglePostPage({ params }) {
  const db = await getDB();
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin";

  // Get the post id from the URL
  const { id: postId } = await params;

  // Get the post itself + the author's display name + channel name
  const post = await db.get(
    `
    SELECT 
      posts.*,
      users.display_name AS author_name,
      channels.name AS channel_name
    FROM posts
    LEFT JOIN users ON posts.author_id = users.id
    LEFT JOIN channels ON posts.channel_id = channels.id
    WHERE posts.id = ?
    `,
    [postId]
  );

  // Get post vote score
  const postVoteResult = await db.get(
    `
    SELECT COALESCE(SUM(value), 0) AS score
    FROM votes
    WHERE target_type = 'post' AND target_id = ?
    `,
    [postId]
  );

  //Get current logged in user vote on this post (if any)
  const postUserVoteResult = user
    ? await db.get(
        `
        SELECT value
        FROM votes
        WHERE user_id = ? AND target_type = 'post' AND target_id = ?
        `,
        [user.id, postId]
      )
    : null;

  const postScore = postVoteResult?.score ?? 0;
  const postUserVote = postUserVoteResult?.value ?? 0;

  // Get all replies for this post + reply author names
  const flatReplies = await db.all(
    `
    SELECT
      replies.*,
      users.display_name AS author_name,
      COALESCE(SUM(votes.value), 0) AS score
    FROM replies
    LEFT JOIN users ON replies.author_id = users.id
    LEFT JOIN votes
      ON votes.target_type = 'reply' AND votes.target_id = replies.id
    WHERE replies.post_id = ?
    GROUP BY replies.id
    ORDER BY replies.created_at ASC
    `,
    [postId]
  );

  //current user's votes on replies
  let replyUserVotes = {};

  if (user && flatReplies.length > 0) {
    const replyVoteRows = await db.all(
      `
      SELECT target_id, value
      FROM votes
      WHERE user_id = ? AND target_type = 'reply'
      `,
      [user.id]
    );

    replyUserVotes = Object.fromEntries(
      replyVoteRows.map((row) => [row.target_id, row.value])
    );
  }

  const screenshots = await db.all(
    `
  SELECT *
  FROM attachments
  WHERE target_type = 'post' AND target_id = ?
  ORDER BY uploaded_at ASC
  `,
    [postId]
  );

  // If post doesn't exist
  if (!post) {
    return (
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
        <p>The post you are looking for does not exist.</p>
      </main>
    );
  }

  // convert flat replies into a tree
  // database rows are flat, but the UI needs a parent/child nested structure.
  function buildReplyTree(replies) {
    const replyMap = {};
    const rootReplies = [];

    replies.forEach((reply) => {
      replyMap[reply.id] = { ...reply, children: [] };
    });

    replies.forEach((reply) => {
      if (reply.parent_reply_id) {
        replyMap[reply.parent_reply_id]?.children.push(replyMap[reply.id]);
      } else {
        rootReplies.push(replyMap[reply.id]);
      }
    });

    return rootReplies;
  }

  const nestedReplies = buildReplyTree(flatReplies);

  return (
    <main className="p-6">
      {/* Post info */}
      <h1 className="text-3xl mb-4">Channel: {post.channel_name}</h1>
      <div className="flex justify-end">
        {isAdmin && (
          <div className="mb-4">
            <DeleteButton
              endpoint={`/api/posts/${postId}`}
              label="Post"
              redirect={`/channels/${post.channel_id}`}
            />
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold mb-3">{post.title}</h3>
      <p className="mb-4 leading-7">{post.body}</p>
      <div className="flex justify-between text-sm text-gray-500 mb-8">
        <span>Author: {post.author_name}</span>
        <span>{post.created_at}</span>
      </div>

      {/* voting for the post */}
      <div className="flex justify-end mb-8">
        <VoteButton
          targetType="post"
          targetId={postId}
          initialScore={postScore}
          initialUserVote={postUserVote}
          canVote={!!user}
        />
      </div>

      {/* Screenshots*/}
      {screenshots.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Screenshots</h2>

          {screenshots.length === 0 ? (
            <p>No screenshots uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {screenshots.map((shot) => (
                <div key={shot.id} className="bg-white p-2 rounded shadow-sm max-w-xs">
                  <Image
                    src={`/api/uploads/${shot.id}`}
                    alt={shot.file_name}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover rounded"
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Replies section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Replies</h2>

        {nestedReplies.length === 0 ? (
          <p>No replies yet.</p>
        ) : (
          <>
            {/* CHANGED: only render ReplyTree */}
            {/* WHY: you were rendering replies twice before:
                1. as nested tree
                2. again as a flat list
                That breaks threaded reply UI and duplicates content. */}
            <ReplyTree
              replies={nestedReplies}
              postId={postId}
              user={user}
              isAdmin={isAdmin}
              replyUserVotes={replyUserVotes}
            />
          </>
        )}
      </section>

      <div className="mt-4 mb-8 ">
        {user ? (
          <ReplyForm postId={postId} />
        ) : (
          <h3 className="text-xl text-gray-600">Log in to reply.</h3>
        )}
      </div>

    </main>
  );
}
import { getDB } from "@/db/db";

export async function GET(request) {
  try {
    const db = await getDB();
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") || "keyword";
    const q = (searchParams.get("q") || "").trim();
    const offset = Number(searchParams.get("offset") || 0);
    const limit = Number(searchParams.get("limit") || 10);

    let results = [];

    // KEYWORD SEARCH
    // Searches channels, posts, and users
    // WHY: this is the main "natural" search experience the app should have
    if (type === "keyword") {
      results = await db.all(
        `
        SELECT 
          'channel' AS result_type,
          channels.id AS item_id,
          channels.name AS title,
          channels.description AS snippet,
          users.display_name AS author_name,
          channels.created_at AS created_at
        FROM channels
        LEFT JOIN users ON channels.created_by = users.id
        WHERE LOWER(channels.name) LIKE LOWER(?)
           OR LOWER(COALESCE(channels.description, '')) LIKE LOWER(?)

        UNION ALL

        SELECT
          'post' AS result_type,
          posts.id AS item_id,
          posts.title AS title,
          posts.body AS snippet,
          users.display_name AS author_name,
          posts.created_at AS created_at
        FROM posts
        LEFT JOIN users ON posts.author_id = users.id
        WHERE LOWER(posts.title) LIKE LOWER(?)
           OR LOWER(posts.body) LIKE LOWER(?)

        UNION ALL

        SELECT
          'user' AS result_type,
          users.id AS item_id,
          users.display_name AS title,
          users.email AS snippet,
          users.display_name AS author_name,
          NULL AS created_at
        FROM users
        WHERE LOWER(users.display_name) LIKE LOWER(?)

        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        `,
        [
          `%${q}%`,
          `%${q}%`,
          `%${q}%`,
          `%${q}%`,
          `%${q}%`,
          limit,
          offset,
        ]
      );
    }

    // AUTHOR SEARCH
    // Returns channels created by the user and posts written by the user
    // WHY: user asked for all user-related content except replies
    else if (type === "author") {
      results = await db.all(
        `
        SELECT
          'channel' AS result_type,
          channels.id AS item_id,
          channels.name AS title,
          channels.description AS snippet,
          users.display_name AS author_name,
          channels.created_at AS created_at
        FROM channels
        JOIN users ON channels.created_by = users.id
        WHERE LOWER(users.display_name) LIKE LOWER(?)

        UNION ALL

        SELECT
          'post' AS result_type,
          posts.id AS item_id,
          posts.title AS title,
          posts.body AS snippet,
          users.display_name AS author_name,
          posts.created_at AS created_at
        FROM posts
        JOIN users ON posts.author_id = users.id
        WHERE LOWER(users.display_name) LIKE LOWER(?)

        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
        `,
        [`%${q}%`, `%${q}%`, limit, offset]
      );
    }

    // USER WITH MOST POSTS
    else if (type === "most-posts") {
      results = await db.all(
        `
        SELECT
          users.id AS item_id,
          users.display_name AS title,
          COUNT(posts.id) AS count
        FROM users
        LEFT JOIN posts ON posts.author_id = users.id
        GROUP BY users.id
        ORDER BY count DESC, users.display_name ASC
        LIMIT ? OFFSET ?
        `,
        [limit, offset]
      );
    }

    // USER WITH LEAST POSTS
    else if (type === "least-posts") {
      results = await db.all(
        `
        SELECT
          users.id AS item_id,
          users.display_name AS title,
          COUNT(posts.id) AS count
        FROM users
        LEFT JOIN posts ON posts.author_id = users.id
        GROUP BY users.id
        ORDER BY count ASC, users.display_name ASC
        LIMIT ? OFFSET ?
        `,
        [limit, offset]
      );
    }

    // HIGHEST RANKED POSTS
    else if (type === "highest-ranked") {
      results = await db.all(
        `
        SELECT
          posts.id AS item_id,
          posts.title AS title,
          posts.body AS snippet,
          users.display_name AS author_name,
          channels.name AS channel_name,
          COALESCE(SUM(votes.value), 0) AS score,
          posts.created_at AS created_at
        FROM posts
        LEFT JOIN users ON posts.author_id = users.id
        LEFT JOIN channels ON posts.channel_id = channels.id
        LEFT JOIN votes
          ON votes.target_type = 'post' AND votes.target_id = posts.id
        GROUP BY posts.id
        ORDER BY score DESC, posts.created_at DESC
        LIMIT ? OFFSET ?
        `,
        [limit, offset]
      );
    }

    // LOWEST RANKED POSTS
    else if (type === "lowest-ranked") {
      results = await db.all(
        `
        SELECT
          posts.id AS item_id,
          posts.title AS title,
          posts.body AS snippet,
          users.display_name AS author_name,
          channels.name AS channel_name,
          COALESCE(SUM(votes.value), 0) AS score,
          posts.created_at AS created_at
        FROM posts
        LEFT JOIN users ON posts.author_id = users.id
        LEFT JOIN channels ON posts.channel_id = channels.id
        LEFT JOIN votes
          ON votes.target_type = 'post' AND votes.target_id = posts.id
        GROUP BY posts.id
        ORDER BY score ASC, posts.created_at DESC
        LIMIT ? OFFSET ?
        `,
        [limit, offset]
      );
    }

    else {
      return Response.json(
        { error: "Invalid search type." },
        { status: 400 }
      );
    }

    return Response.json({ results });
  } catch (error) {
    console.error("GET /api/search error:", error);

    return Response.json(
      { error: "Search failed." },
      { status: 500 }
    );
  }
}
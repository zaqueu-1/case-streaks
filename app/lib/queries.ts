export const queries = {
  getUserByEmail: `
    SELECT * FROM users WHERE email = $1
  `,

  updateUserPoints: `
    UPDATE users 
    SET points = $1, level = $2, total_accesses = $3 
    WHERE id = $4
    RETURNING *
  `,

  getRecentAccesses: `
    SELECT * FROM accesses 
    WHERE user_id = $1 
    ORDER BY timestamp DESC 
    LIMIT $2
  `,

  registerAccess: `
    INSERT INTO accesses (user_id, post_id, timestamp, utm_source, utm_medium, utm_campaign, utm_channel)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,

  getUserStats: `
    WITH user_data AS (
      SELECT 
        u.id,
        u.email,
        u.is_admin,
        u.last_access,
        u.created_at,
        u.points,
        u.level,
        COUNT(a.id) as total_accesses,
        MIN(a.timestamp) as first_access,
        MAX(a.timestamp) as last_access_from_accesses,
        COALESCE(json_agg(a.* ORDER BY a.timestamp DESC) FILTER (WHERE a.id IS NOT NULL), '[]') as recent_accesses
      FROM users u
      LEFT JOIN accesses a ON u.id = a.user_id
      WHERE u.email = $1
      GROUP BY u.id, u.email, u.is_admin, u.last_access, u.created_at, u.points, u.level
    )
    SELECT 
      ud.id,
      ud.email,
      ud.is_admin,
      ud.last_access,
      ud.created_at,
      ud.total_accesses,
      ud.points,
      ud.level,
      ud.first_access,
      ud.recent_accesses
    FROM user_data ud
  `,

  removeDuplicateAccesses: `
    WITH grouped_accesses AS (
      SELECT 
        id,
        user_id,
        post_id,
        timestamp,
        LAG(timestamp) OVER (
          PARTITION BY user_id, post_id 
          ORDER BY timestamp
        ) as prev_timestamp,
        FIRST_VALUE(id) OVER (
          PARTITION BY user_id, post_id, DATE(timestamp)
          ORDER BY timestamp
        ) as first_access_id
      FROM accesses
    ),
    duplicates AS (
      SELECT id
      FROM grouped_accesses
      WHERE 
        prev_timestamp IS NOT NULL 
        AND EXTRACT(EPOCH FROM (timestamp - prev_timestamp)) < 60
        AND id != first_access_id
    )
    DELETE FROM accesses a
    WHERE EXISTS (
      SELECT 1 FROM duplicates d WHERE d.id = a.id
    )
    RETURNING *
  `,

  // excluindo domingos
  getCurrentStreak: `
    WITH dates AS (
      SELECT DISTINCT DATE(timestamp AT TIME ZONE 'America/Sao_Paulo') as access_date
      FROM accesses 
      WHERE user_id = $1
        AND EXTRACT(DOW FROM timestamp AT TIME ZONE 'America/Sao_Paulo') != 0  -- Exclui domingos
        AND DATE(timestamp AT TIME ZONE 'America/Sao_Paulo') <= CURRENT_DATE
      ORDER BY access_date DESC
    ),
    streak_count AS (
      SELECT 
        access_date,
        CASE
          WHEN LAG(access_date) OVER w IS NULL THEN 1
          WHEN LAG(access_date) OVER w = access_date + INTERVAL '1 day' THEN 1
          WHEN LAG(access_date) OVER w = access_date + INTERVAL '2 days' 
            AND EXTRACT(DOW FROM access_date + INTERVAL '1 day') = 0 THEN 1
          ELSE 0
        END as is_consecutive
      FROM dates
      WINDOW w AS (ORDER BY access_date DESC)
    ),
    current_streak AS (
      SELECT SUM(is_consecutive) as days
      FROM streak_count
      WHERE access_date >= (
        SELECT COALESCE(
          (
            SELECT access_date
            FROM streak_count
            WHERE is_consecutive = 0
            ORDER BY access_date DESC
            LIMIT 1
          ),
          (SELECT MIN(access_date) FROM streak_count)
        )
      )
    )
    SELECT 
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM dates 
          WHERE access_date >= CURRENT_DATE - INTERVAL '1 day'
            AND (
              access_date = CURRENT_DATE 
              OR EXTRACT(DOW FROM CURRENT_DATE) = 0
              OR (
                access_date = CURRENT_DATE - INTERVAL '1 day'
                AND CURRENT_TIME < TIME '23:59:59'
              )
            )
        ) THEN COALESCE((SELECT days FROM current_streak), 1)
        ELSE 0
      END as current_streak
  `,

  getLongestStreak: `
    WITH dates AS (
      SELECT DISTINCT DATE(timezone('America/Sao_Paulo', timestamp)) as access_date
      FROM accesses 
      WHERE user_id = $1
        AND EXTRACT(DOW FROM timezone('America/Sao_Paulo', timestamp)) != 0
      ORDER BY access_date
    ),
    streak_groups AS (
      SELECT 
        access_date,
        CASE
          WHEN LAG(access_date) OVER (ORDER BY access_date) IS NULL THEN 1
          WHEN access_date - LAG(access_date) OVER (ORDER BY access_date) = 1 THEN 0
          WHEN access_date - LAG(access_date) OVER (ORDER BY access_date) = 2 
            AND EXTRACT(DOW FROM access_date - INTERVAL '1 day') = 0 THEN 0
          ELSE 1
        END as is_new_streak
      FROM dates
    ),
    streaks AS (
      SELECT 
        access_date,
        SUM(is_new_streak) OVER (ORDER BY access_date) as streak_id
      FROM streak_groups
    ),
    streak_lengths AS (
      SELECT COUNT(*) as length
      FROM streaks
      GROUP BY streak_id
    )
    SELECT COALESCE(
      (
        SELECT MAX(length)
        FROM streak_lengths
      ),
      0
    ) as longest_streak
  `,

  getUtmStats: `
    SELECT 
      json_build_object(
        'sources', (
          SELECT json_object_agg(utm_source, count)
          FROM (
            SELECT utm_source, COUNT(*) as count
            FROM accesses
            WHERE user_id = $1 AND utm_source IS NOT NULL
            GROUP BY utm_source
          ) s
        ),
        'mediums', (
          SELECT json_object_agg(utm_medium, count)
          FROM (
            SELECT utm_medium, COUNT(*) as count
            FROM accesses
            WHERE user_id = $1 AND utm_medium IS NOT NULL
            GROUP BY utm_medium
          ) m
        ),
        'campaigns', (
          SELECT json_object_agg(utm_campaign, count)
          FROM (
            SELECT utm_campaign, COUNT(*) as count
            FROM accesses
            WHERE user_id = $1 AND utm_campaign IS NOT NULL
            GROUP BY utm_campaign
          ) c
        ),
        'channels', (
          SELECT json_object_agg(utm_channel, count)
          FROM (
            SELECT utm_channel, COUNT(*) as count
            FROM accesses
            WHERE user_id = $1 AND utm_channel IS NOT NULL
            GROUP BY utm_channel
          ) ch
        )
      ) as utm_stats
  `,

  getAdminStats: `
    WITH user_stats AS (
      SELECT 
        COUNT(DISTINCT CASE WHEN email NOT LIKE '%@admin.com' THEN u.id END) as total_users,
        COUNT(DISTINCT CASE 
          WHEN DATE(u.last_access) >= CURRENT_DATE - INTERVAL '7 days' 
          AND email NOT LIKE '%@admin.com'
          THEN u.id 
        END) as active_users,
        COALESCE(AVG(
          CASE 
            WHEN EXISTS (
              SELECT 1 FROM accesses a2 
              WHERE a2.user_id = u.id 
              AND DATE(a2.timestamp) = CURRENT_DATE
            ) 
            AND email NOT LIKE '%@admin.com'
            THEN (
              SELECT COUNT(*)
              FROM accesses a3
              WHERE a3.user_id = u.id
              AND DATE(a3.timestamp) >= (
                SELECT COALESCE(
                  (
                    SELECT DATE(a4.timestamp)
                    FROM accesses a4
                    WHERE a4.user_id = u.id
                    AND DATE(a4.timestamp) < DATE(a3.timestamp)
                    AND DATE(a4.timestamp + INTERVAL '1 day') != DATE(a3.timestamp)
                    ORDER BY a4.timestamp DESC
                    LIMIT 1
                  ),
                  DATE(a3.timestamp)
                )
              )
            )
            ELSE 0
          END
        ), 0) as avg_streak
      FROM users u
      WHERE email NOT LIKE '%@admin.com'
    ),
    engagement_data AS (
      SELECT 
        DATE(timestamp) as date,
        COUNT(DISTINCT CASE WHEN u.email NOT LIKE '%@admin.com' THEN u.id END) as users,
        COUNT(CASE WHEN u.email NOT LIKE '%@admin.com' THEN a.id END) as accesses
      FROM accesses a
      JOIN users u ON a.user_id = u.id
      WHERE DATE(timestamp) >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    ),
    top_users AS (
      SELECT 
        u.email,
        u.points,
        u.level,
        COALESCE(COUNT(DISTINCT DATE(timezone('America/Sao_Paulo', a.timestamp))), 0) as unique_days,
        COALESCE(COUNT(a.id), 0) as total_accesses,
        COALESCE(MAX(timezone('America/Sao_Paulo', a.timestamp)), timezone('America/Sao_Paulo', u.created_at)) as last_access,
        COALESCE((
          WITH dates AS (
            SELECT DISTINCT DATE(timezone('America/Sao_Paulo', a2.timestamp)) as access_date
            FROM accesses a2
            WHERE a2.user_id = u.id
              AND EXTRACT(DOW FROM timezone('America/Sao_Paulo', a2.timestamp)) != 0
            ORDER BY access_date
          ),
          streak_groups AS (
            SELECT 
              access_date,
              CASE
                WHEN LAG(access_date) OVER (ORDER BY access_date) IS NULL THEN 1
                WHEN access_date - LAG(access_date) OVER (ORDER BY access_date) = 1 THEN 0
                WHEN access_date - LAG(access_date) OVER (ORDER BY access_date) = 2 
                  AND EXTRACT(DOW FROM access_date - INTERVAL '1 day') = 0 THEN 0
                ELSE 1
              END as is_new_streak
            FROM dates
          ),
          streaks AS (
            SELECT 
              access_date,
              SUM(is_new_streak) OVER (ORDER BY access_date) as streak_id
            FROM streak_groups
          ),
          streak_lengths AS (
            SELECT COUNT(*) as length
            FROM streaks
            GROUP BY streak_id
          )
          SELECT COALESCE(MAX(length), 0)
          FROM streak_lengths
        ), 0) as max_streak
      FROM users u
      LEFT JOIN accesses a ON u.id = a.user_id
      WHERE u.email NOT LIKE '%@admin.com'
        AND u.points > 0
      GROUP BY u.id, u.email, u.points, u.level, u.created_at
      ORDER BY u.points DESC, u.level DESC, u.created_at ASC
    ),
    utm_stats AS (
      WITH total_accesses AS (
        SELECT COUNT(*) as total
        FROM accesses a
        JOIN users u ON a.user_id = u.id
        WHERE u.email NOT LIKE '%@admin.com'
      ),
      sources_data AS (
        SELECT 
          COALESCE(utm_source, 'unknown') as value,
          COUNT(*) as count,
          ROUND((COUNT(*)::numeric / NULLIF((SELECT total FROM total_accesses), 0)::numeric * 100), 2) as percentage,
          post_id,
          timestamp
        FROM accesses a
        JOIN users u ON a.user_id = u.id
        WHERE u.email NOT LIKE '%@admin.com'
        GROUP BY utm_source, post_id, timestamp
        ORDER BY 
          CASE WHEN COALESCE(utm_source, 'unknown') = 'unknown' THEN 1 ELSE 0 END,
          COALESCE(utm_source, 'unknown') ASC
      ),
      mediums_data AS (
        SELECT 
          COALESCE(utm_medium, 'unknown') as value,
          COUNT(*) as count,
          ROUND((COUNT(*)::numeric / NULLIF((SELECT total FROM total_accesses), 0)::numeric * 100), 2) as percentage,
          post_id,
          timestamp
        FROM accesses a
        JOIN users u ON a.user_id = u.id
        WHERE u.email NOT LIKE '%@admin.com'
        GROUP BY utm_medium, post_id, timestamp
        ORDER BY 
          CASE WHEN COALESCE(utm_medium, 'unknown') = 'unknown' THEN 1 ELSE 0 END,
          COALESCE(utm_medium, 'unknown') ASC
      ),
      campaigns_data AS (
        SELECT 
          COALESCE(utm_campaign, 'unknown') as value,
          COUNT(*) as count,
          ROUND((COUNT(*)::numeric / NULLIF((SELECT total FROM total_accesses), 0)::numeric * 100), 2) as percentage,
          post_id,
          timestamp
        FROM accesses a
        JOIN users u ON a.user_id = u.id
        WHERE u.email NOT LIKE '%@admin.com'
        GROUP BY utm_campaign, post_id, timestamp
        ORDER BY 
          CASE WHEN COALESCE(utm_campaign, 'unknown') = 'unknown' THEN 1 ELSE 0 END,
          COALESCE(utm_campaign, 'unknown') ASC
      ),
      channels_data AS (
        SELECT 
          COALESCE(utm_channel, 'unknown') as value,
          COUNT(*) as count,
          ROUND((COUNT(*)::numeric / NULLIF((SELECT total FROM total_accesses), 0)::numeric * 100), 2) as percentage,
          post_id,
          timestamp
        FROM accesses a
        JOIN users u ON a.user_id = u.id
        WHERE u.email NOT LIKE '%@admin.com'
        GROUP BY utm_channel, post_id, timestamp
        ORDER BY 
          CASE WHEN COALESCE(utm_channel, 'unknown') = 'unknown' THEN 1 ELSE 0 END,
          COALESCE(utm_channel, 'unknown') ASC
      ),
      posts_data AS (
        SELECT DISTINCT
          post_id as id,
          COALESCE(
            SUBSTRING(post_id FROM 6), -- Remove 'post_' prefix
            post_id
          ) as title
        FROM accesses
        WHERE post_id IS NOT NULL
        ORDER BY post_id
      )
      SELECT json_build_object(
        'sources', (SELECT json_agg(sources_data.*) FROM sources_data),
        'mediums', (SELECT json_agg(mediums_data.*) FROM mediums_data),
        'campaigns', (SELECT json_agg(campaigns_data.*) FROM campaigns_data),
        'channels', (SELECT json_agg(channels_data.*) FROM channels_data)
      ) as utm_data,
      (SELECT json_agg(posts_data.*) FROM posts_data) as posts
    )
    SELECT 
      json_build_object(
        'overview', (
          SELECT row_to_json(user_stats.*)
          FROM user_stats
        ),
        'engagement', (
          SELECT json_agg(engagement_data.*)
          FROM engagement_data
        ),
        'topUsers', (
          SELECT json_agg(top_users.*)
          FROM top_users
        ),
        'utmStats', (
          SELECT utm_data
          FROM utm_stats
        ),
        'posts', (
          SELECT posts
          FROM utm_stats
        )
      ) as admin_stats
  `,
}

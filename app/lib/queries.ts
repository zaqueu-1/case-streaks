export const queries = {
  // Usuários
  getUserByEmail: `
    SELECT * FROM users WHERE email = $1
  `,

  updateUserPoints: `
    UPDATE users 
    SET points = $1, level = $2, total_accesses = $3 
    WHERE id = $4
    RETURNING *
  `,

  // Acessos
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

  // Estatísticas
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

  // Limpeza
  removeDuplicateAccesses: `
    WITH duplicates AS (
      SELECT DISTINCT ON (user_id, post_id, DATE(timestamp))
        id
      FROM accesses
      ORDER BY user_id, post_id, DATE(timestamp), timestamp
    )
    DELETE FROM accesses a
    WHERE NOT EXISTS (
      SELECT 1 FROM duplicates d WHERE d.id = a.id
    )
    RETURNING *
  `,

  // Contagem de dias úteis (excluindo domingos)
  getCurrentStreak: `
    WITH dates AS (
      SELECT DISTINCT DATE(timestamp) as access_date
      FROM accesses 
      WHERE user_id = $1
        AND EXTRACT(DOW FROM timestamp) != 0  -- Exclui domingos
        AND DATE(timestamp) <= CURRENT_DATE
      ORDER BY access_date DESC
    ),
    streak_breaks AS (
      SELECT 
        access_date,
        CASE
          WHEN LAG(access_date) OVER (ORDER BY access_date DESC) IS NULL THEN FALSE
          WHEN access_date - LAG(access_date) OVER (ORDER BY access_date DESC) = 1 THEN FALSE
          WHEN access_date - LAG(access_date) OVER (ORDER BY access_date DESC) = 2 
            AND EXTRACT(DOW FROM access_date - INTERVAL '1 day') = 0 THEN FALSE
          ELSE TRUE
        END as is_streak_break
      FROM dates
    ),
    current_streak AS (
      SELECT 
        CASE
          WHEN EXISTS (SELECT 1 FROM dates WHERE access_date = CURRENT_DATE) THEN (
            SELECT COUNT(*)
            FROM dates
            WHERE access_date >= (
              SELECT COALESCE(
                (
                  SELECT access_date
                  FROM streak_breaks
                  WHERE is_streak_break = TRUE
                  ORDER BY access_date DESC
                  LIMIT 1
                ),
                (SELECT MIN(access_date) FROM dates)
              )
            )
          )
          ELSE 0
        END as streak_length
    )
    SELECT streak_length as current_streak FROM current_streak
  `,

  getLongestStreak: `
    WITH dates AS (
      SELECT DISTINCT DATE(timezone('America/Sao_Paulo', timestamp)) as access_date
      FROM accesses 
      WHERE user_id = $1
        AND EXTRACT(DOW FROM timezone('America/Sao_Paulo', timestamp)) != 0
        AND DATE(timezone('America/Sao_Paulo', timestamp)) <= CURRENT_DATE AT TIME ZONE 'America/Sao_Paulo'
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

  // Mantendo a função original para compatibilidade
  getWorkingDayStreak: `
    WITH current_streak AS (
      SELECT DISTINCT DATE(timestamp) as access_date
      FROM accesses 
      WHERE user_id = $1
        AND EXTRACT(DOW FROM timestamp) != 0
        AND DATE(timestamp) <= CURRENT_DATE
      ORDER BY access_date DESC
    ),
    longest_streak AS (
      SELECT DISTINCT DATE(timestamp) as access_date
      FROM accesses 
      WHERE user_id = $1
        AND EXTRACT(DOW FROM timestamp) != 0
        AND DATE(timestamp) <= CURRENT_DATE
      ORDER BY access_date
    ),
    streak_groups AS (
      SELECT 
        access_date,
        CASE
          WHEN LAG(access_date) OVER w IS NULL THEN 1
          WHEN access_date = LAG(access_date) OVER w + 1 THEN 0
          WHEN access_date = LAG(access_date) OVER w + 2 
            AND EXTRACT(DOW FROM LAG(access_date) OVER w + 1) = 0 THEN 0
          ELSE 1
        END as new_group
      FROM longest_streak
      WINDOW w AS (ORDER BY access_date)
    ),
    groups AS (
      SELECT 
        access_date,
        SUM(new_group) OVER (ORDER BY access_date) as group_id
      FROM streak_groups
    ),
    streak_lengths AS (
      SELECT COUNT(*) as length
      FROM groups
      GROUP BY group_id
    )
    SELECT 
      CASE 
        WHEN NOT EXISTS (
          SELECT 1 FROM current_streak WHERE access_date = CURRENT_DATE
        ) THEN 0
        ELSE (
          SELECT COUNT(*)
          FROM current_streak
          WHERE access_date >= (
            SELECT MIN(access_date)
            FROM (
              SELECT 
                access_date,
                LAG(access_date) OVER (ORDER BY access_date DESC) as prev_date
              FROM current_streak
            ) d
            WHERE access_date - prev_date > 2
               OR (
                 access_date - prev_date = 2 
                 AND EXTRACT(DOW FROM access_date - INTERVAL '1 day') != 0
               )
            LIMIT 1
          )
        )
      END as streak_length,
      COALESCE(
        (SELECT MAX(length) FROM streak_lengths),
        0
      ) as longest_streak
  `,

  // UTM Stats
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
}

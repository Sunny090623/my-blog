// /functions/api/stats.js
export async function onRequest(context) {
    const { env } = context;
    const postsResult = await env.DB.prepare("SELECT COUNT(*) as count FROM posts WHERE is_published = 1").first();
    const usersResult = await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE role != 'superadmin'").first();
    return new Response(JSON.stringify({
        postsCount: postsResult.count || 0,
        usersCount: usersResult.count || 0
    }), { headers: { 'Content-Type': 'application/json' } });
}

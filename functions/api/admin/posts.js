// /functions/api/admin/posts.js
import { getCurrentUserId } from '../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    const userId = await getCurrentUserId(request, env);
    if (!userId) {
        return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
    }

    // 使用普通字符串拼接，避免模板字符串可能引起的解析问题
    const sql = `
        SELECT 
            p.slug, 
            p.title, 
            p.excerpt, 
            p.tags, 
            p.updated_at,
            u.username as author,
            p.author_id
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        ORDER BY p.updated_at DESC
    `;

    const { results } = await env.DB.prepare(sql).all();

    return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' }
    });
}
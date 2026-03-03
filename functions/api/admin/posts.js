// /functions/api/admin/posts.js
import { getCurrentUserId } from '../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    const userId = await getCurrentUserId(request, env);
    if (!userId) {
        return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
    }

    const { results: userResults } = await env.DB.prepare(
        'SELECT role FROM users WHERE id = ?'
    ).bind(userId).all();
    const role = userResults[0]?.role;

    let sql, params = [];
    if (role === 'superadmin') {
        sql = `SELECT p.slug, p.title, p.excerpt, p.tags, p.updated_at, u.username as author, p.author_id, p.is_published
               FROM posts p
               LEFT JOIN users u ON p.author_id = u.id
               ORDER BY p.updated_at DESC`;
    } else if (role === 'admin') {
        sql = `SELECT p.slug, p.title, p.excerpt, p.tags, p.updated_at, u.username as author, p.author_id, p.is_published
               FROM posts p
               LEFT JOIN users u ON p.author_id = u.id
               WHERE p.is_published = 1 OR p.author_id = ?
               ORDER BY p.updated_at DESC`;
        params = [userId];
    } else {
        sql = `SELECT p.slug, p.title, p.excerpt, p.tags, p.updated_at, u.username as author, p.author_id, p.is_published
               FROM posts p
               LEFT JOIN users u ON p.author_id = u.id
               WHERE p.author_id = ?
               ORDER BY p.updated_at DESC`;
        params = [userId];
    }

    const { results } = await env.DB.prepare(sql).bind(...params).all();
    return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' }
    });
}

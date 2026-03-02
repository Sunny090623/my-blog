// /functions/api/user/me.js
import { getCurrentUserId } from '../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    const userId = await getCurrentUserId(request, env);
    if (!userId) {
        return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
    }

    const { results } = await env.DB.prepare(
        'SELECT username, role FROM users WHERE id = ?'  // 同时查询 role
    ).bind(userId).all();
    
    if (results.length === 0) {
        return new Response(JSON.stringify({ error: '用户不存在' }), { status: 404 });
    }

    return new Response(JSON.stringify({
        username: results[0].username,
        role: results[0].role 
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}

// /functions/api/login.js
import { verifyPassword } from './utils/auth';  // 稍后定义

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { username, password } = await request.json();

    // 从数据库查询用户
    const { results } = await env.DB.prepare(
      'SELECT id, password_hash, salt FROM users WHERE username = ?'
    ).bind(username).all();

    if (results.length === 0) {
      return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = results[0];
    const isValid = await verifyPassword(password, user.salt, user.password_hash);

    if (!isValid) {
      return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 创建会话
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天

    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
    ).bind(sessionId, user.id, expiresAt.toISOString()).run();

    // 设置 Cookie
    const headers = new Headers({
      'Set-Cookie': `session_id=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`,
      'Content-Type': 'application/json'
    });

    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

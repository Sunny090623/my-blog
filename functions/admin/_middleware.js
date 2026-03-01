export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  console.log('中间件拦截路径:', url.pathname);

  // 必须放行登录页
  if (url.pathname === '/admin/login.html' || url.pathname === '/admin/login') {
    return await next();  // 直接通过，不检查会话
  }
  if (url.pathname.startsWith('/admin/') || url.pathname === '/users.html') {

  // 检查 Cookie
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [key, value] = c.split('=');
      return [key, value];
    })
  );
  const sessionId = cookies.session_id;

  if (!sessionId) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/admin/login.html' }
    });
  }

  // 验证会话
  const { results } = await env.DB.prepare(
    'SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?'
  ).bind(sessionId, new Date().toISOString()).all();

  if (results.length === 0) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/admin/login.html' }
    });
  }

  const userId = results[0].user_id;

  return await next();
}

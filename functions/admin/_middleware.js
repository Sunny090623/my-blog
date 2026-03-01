export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  
  // 必须放行登录页
  if (url.pathname === '/admin/login.html' || url.pathname === '/admin/login' || url.pathname === '/register.html') {
    return await next();  // 直接通过，不检查会话
  }
  i

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
          'SELECT user_id, role FROM sessions WHERE id = ? AND expires_at > ?'
      ).bind(sessionId, new Date().toISOString()).all();

      if (results.length === 0) {
          return new Response(null, {
              status: 302,
              headers: { Location: '/admin/login.html' }
          });
      }
      const { user_id: userId, role } = results[0];
      // 权限检查
      // 如果访问的是 admin.html 或 users.html，仅允许 admin
      if (url.pathname === '/admin.html' || url.pathname === '/users.html') {
        if (role !== 'admin') {
            // 普通用户重定向到首页或登录页
            return new Response(null, { status: 302, headers: { Location: '/' } });
        }
    }

    // 对于 /admin/* 下的其他资源（如 API），可能也需要区分，但 API 自己会检查权限
    // 将用户信息附加到请求上下文中，供后续 API 使用
    // 我们可以通过修改 request 对象的属性或使用 context 传递
    // 简便方法：在 env 上挂载临时属性，但 env 是只读的。我们可以在 next() 之前将用户信息存入 request 的 headers（不推荐）。
    // 更好的方式：让 API 自己从会话查询角色。我们就不在这里传递了。

      // 会话有效，继续处理请求
      return await next();
    }

    // 其他路径不处理（直接放行）
    return await next();
}

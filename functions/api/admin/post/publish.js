// /functions/api/admin/post/publish.js
import { getCurrentUserId } from '../../utils/auth';
import { generateSlug } from '../../utils/generateSlug';

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const userId = await getCurrentUserId(request, env);
    if (!userId) {
        return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
    }

    const { results: userResults } = await env.DB.prepare(
        'SELECT role FROM users WHERE id = ?'
    ).bind(userId).all();
    const role = userResults[0]?.role;

    try {
        const { slug } = await request.json();
        if (!slug) {
            return new Response(JSON.stringify({ error: 'slug不能为空' }), { status: 400 });
        }

        // 查询文章
        const { results } = await env.DB.prepare(
            'SELECT author_id, is_published FROM posts WHERE slug = ?'
        ).bind(slug).all();
        if (results.length === 0) {
            return new Response(JSON.stringify({ error: '文章不存在' }), { status: 404 });
        }

        const authorId = results[0].author_id;
        const isPublished = results[0].is_published;

        // 权限：作者本人、admin、superadmin 可发表
        if (role !== 'admin' && role !== 'superadmin' && authorId !== userId) {
            return new Response(JSON.stringify({ error: '无权发表' }), { status: 403 });
        }

        if (isPublished) {
            return new Response(JSON.stringify({ error: '文章已发表' }), { status: 400 });
        }

        // 生成新的正式 slug
        const newSlug = await generateSlug(env);
        await env.DB.prepare(
            'UPDATE posts SET slug = ?, is_published = 1 WHERE slug = ?'
        ).bind(newSlug, slug).run();

        return new Response(JSON.stringify({ success: true, newSlug }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

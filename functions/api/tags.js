// /functions/api/tags.js
export async function onRequest(context) {
    const { env } = context;

    const { results } = await env.DB.prepare("SELECT tags FROM posts").all();

    const tagCount = new Map();
    results.forEach(row => {
        if (row.tags) {
            row.tags.split(',').forEach(tag => {
                tag = tag.trim();
                if (tag) {
                    tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
                }
            });
        }
    });

    const tags = Array.from(tagCount.entries()).map(([name, count]) => ({ name, count }));
    return new Response(JSON.stringify(tags), {
        headers: { 'Content-Type': 'application/json' }
    });
}

// /functions/api/utils/generateDraftSlug.js
export async function generateDraftSlug(env) {
    const { results } = await env.DB.prepare("SELECT slug FROM posts WHERE slug LIKE 'draft%'").all();
    let maxNum = 0;
    for (const row of results) {
        const num = parseInt(row.slug.replace('draft', ''), 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
    }
    return `draft${maxNum + 1}`;
}

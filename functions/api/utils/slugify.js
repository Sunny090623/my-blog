export function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // 空格替换为 -
        .replace(/[^\w\-]+/g, '')       // 移除所有非单词字符
        .replace(/\-\-+/g, '-')          // 合并多个 - 为一个
        .replace(/^-+/, '')               // 移除开头 -
        .replace(/-+$/, '');              // 移除结尾 -
}

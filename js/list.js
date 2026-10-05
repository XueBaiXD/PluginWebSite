document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('postList');
    const config = getConfig();

    if (!config) {
        container.innerHTML = '<div class="empty">页面配置错误</div>';
        return;
    }

    try {
        const res = await fetch('data/' + config.json);
        if (!res.ok) throw new Error('数据文件不存在');

        let files = await res.json();
        if (!Array.isArray(files)) files = [];

        files.sort(compareNames);

        if (files.length === 0) {
            container.innerHTML = '<div class="empty">暂无内容</div>';
            return;
        }

        container.innerHTML = '';

        for (const file of files) {
            const path = config.dir + '/' + file;
            try {
                const mdRes = await fetch(path);
                if (!mdRes.ok) continue;

                const md = await mdRes.text();
                const title = extractTitle(md, stripExt(file));
                const summary = extractSummary(md);
                const date = extractDate(file);

                const item = document.createElement('a');
                item.className = 'post-item';
                item.href = 'post.html?type=' + encodeURIComponent(config.type)
                          + '&file=' + encodeURIComponent(file);

                item.innerHTML = `
                    <div class="post-item-icon">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round"
                             stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                    </div>
                    <div class="post-item-body">
                        <div class="post-item-title">${escapeHtml(title)}</div>
                        ${summary ? `<div class="post-item-summary">${escapeHtml(summary)}</div>` : ''}
                    </div>
                    ${date ? `<div class="post-item-date">${escapeHtml(date)}</div>` : ''}
                    <div class="post-item-arrow">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" stroke-width="2" stroke-linecap="round"
                             stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                `;

                container.appendChild(item);
            } catch (e) {
                console.warn('加载失败', path, e);
            }
        }

        if (container.children.length === 0) {
            container.innerHTML = '<div class="empty">暂无内容</div>';
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="empty">加载失败</div>';
    }
});

function getConfig() {
    const type = document.body.dataset.list;
    if (type === 'announcements') {
        return { type: 'announcements', json: 'announcements.json', dir: 'announcements' };
    }
    if (type === 'site-changelogs') {
        return { type: 'site-changelogs', json: 'site-changelogs.json', dir: 'site-changelogs' };
    }
    return null;
}

/** 从 markdown 提取一级标题 */
function extractTitle(md, fallback) {
    const m = md.match(/^#\s+(.+)$/m);
    return m ? m[1].trim() : fallback;
}

/** 从 markdown 提取第一段正文作为摘要 */
function extractSummary(md) {
    const lines = md.split('\n');
    let passedTitle = false;
    const buf = [];

    for (const line of lines) {
        const t = line.trim();
        if (!passedTitle) {
            if (t.startsWith('# ')) passedTitle = true;
            continue;
        }
        if (!t) {
            if (buf.length > 0) break;
            continue;
        }
        if (t.startsWith('#') || t.startsWith('>') || t.startsWith('```') || t.startsWith('|')) break;
        buf.push(t);
    }

    let text = buf.join(' ').replace(/[*_`\[\]]/g, '');
    if (text.length > 100) text = text.slice(0, 100) + '...';
    return text;
}

/** 从文件名提取日期，比如 a-20261005-init.md → 2026-10-05 */
function extractDate(filename) {
    const m = filename.match(/(\d{4})(\d{2})(\d{2})/);
    if (!m) return '';
    return m[1] + '-' + m[2] + '-' + m[3];
}

function stripExt(name) {
    return name.replace(/\.md$/i, '');
}

/** 排序：逐字符，a-z > A-Z > 0-9 */
function compareNames(a, b) {
    const nameA = stripExt(a);
    const nameB = stripExt(b);
    const len = Math.min(nameA.length, nameB.length);

    for (let i = 0; i < len; i++) {
        const prioA = charPriority(nameA[i]);
        const prioB = charPriority(nameB[i]);
        if (prioA !== prioB) return prioA - prioB;

        const codeA = nameA.charCodeAt(i);
        const codeB = nameB.charCodeAt(i);
        if (codeA !== codeB) return codeB - codeA;
    }
    return nameB.length - nameA.length;
}

function charPriority(ch) {
    if (ch >= 'a' && ch <= 'z') return 0;
    if (ch >= 'A' && ch <= 'Z') return 1;
    if (ch >= '0' && ch <= '9') return 2;
    return 3;
}

function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
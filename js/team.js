document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('teamGrid');

    try {
        const res = await fetch('data/team.json');
        if (!res.ok) throw new Error('数据文件不存在');

        let members = await res.json();
        if (!Array.isArray(members)) members = [];

        if (members.length === 0) {
            container.innerHTML = '<div class="empty">暂无团队成员</div>';
            return;
        }

        container.innerHTML = members.map(renderCard).join('');
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="empty">加载失败</div>';
    }
});

function renderCard(m) {
    const name = m.name || '';

    const avatarHtml = m.avatar
        ? `<img class="team-avatar" src="${escapeHtml(m.avatar)}" alt="${escapeHtml(name)}">`
        : `<div class="team-avatar team-avatar-placeholder">${escapeHtml(name.charAt(0) || '?')}</div>`;

    const tagsHtml = (m.tags || [])
        .map(t => `<span class="plugin-tag">${escapeHtml(t)}</span>`)
        .join('');

    return `
        <div class="team-card">
            <div class="team-card-top">
                ${avatarHtml}
                <div class="team-card-info">
                    <div class="team-name">${escapeHtml(name)}</div>
                    <div class="team-role">${escapeHtml(m.role || '')}</div>
                </div>
            </div>
            ${m.description ? `<div class="team-desc">${escapeHtml(m.description)}</div>` : ''}
            ${tagsHtml ? `<div class="plugin-tags">${tagsHtml}</div>` : ''}
            ${renderLinks(m.links)}
        </div>
    `;
}

function renderLinks(links) {
    if (!links || typeof links !== 'object') return '';

    const LABELS = {
        github:   'GitHub',
        bilibili: 'B站',
        qq:       'QQ',
        email:    '邮箱',
        discord:  'Discord',
        twitter:  'Twitter',
        weibo:    '微博',
        website:  '网站'
    };

    const parts = [];

    for (const [key, value] of Object.entries(links)) {
        if (!value) continue;

        const label = LABELS[key] || key;

        // QQ 号无法直接点开，显示为普通文本
        if (key === 'qq') {
            parts.push(`<span class="team-link team-link-static">${escapeHtml(label)}: ${escapeHtml(value)}</span>`);
            continue;
        }

        let href = value;
        if (key === 'email' && !href.startsWith('mailto:')) {
            href = 'mailto:' + href;
        }

        parts.push(`<a class="team-link" href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`);
    }

    if (parts.length === 0) return '';
    return `<div class="team-links">${parts.join('')}</div>`;
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
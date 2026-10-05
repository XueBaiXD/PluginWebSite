document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');

    if (!id) {
        showError('缺少插件 ID');
        return;
    }

    try {
        const res = await fetch('data/plugins.json');
        const plugins = await res.json();
        const plugin = plugins.find(p => p.id === id);

        if (!plugin) {
            showError('没有找到这个插件');
            return;
        }

        document.title = plugin.name + ' - XueBaiXD';
        await renderDetail(plugin);
    } catch (e) {
        console.error(e);
        showError('加载失败');
    }
});

async function renderDetail(plugin) {
    const container = document.getElementById('pluginDetail');

    // ===== 头部 =====
    const iconHtml = plugin.icon
        ? `<img class="plugin-detail-icon" src="${escapeHtml(plugin.icon)}" alt="${escapeHtml(plugin.name)}">`
        : `<div class="plugin-icon-placeholder" style="width:96px;height:96px;font-size:36px;">${escapeHtml(plugin.name.charAt(0))}</div>`;

    const buttons = [];
    if (plugin.download) {
        buttons.push(`<a href="${escapeHtml(plugin.download)}" class="btn btn-primary" target="_blank" rel="noopener">下载</a>`);
    }
    if (plugin.source) {
        buttons.push(`<a href="${escapeHtml(plugin.source)}" class="btn btn-outline" target="_blank" rel="noopener">源码</a>`);
    }

    // ===== 预加载三个内容 =====
    const [readmeHtml, changelogHtml] = await Promise.all([
        loadMarkdown(plugin.readme),
        loadMarkdown(plugin.changelog)
    ]);

    // ===== 截图 =====
    const screenshotsHtml = (plugin.screenshots && plugin.screenshots.length > 0)
        ? plugin.screenshots.map(src =>
            `<img class="screenshot" src="${escapeHtml(src)}" alt="截图" loading="lazy">`
        ).join('')
        : '<div class="empty">暂无截图</div>';

    // ===== 组装页面 =====
    container.innerHTML = `
        <div class="plugin-detail-header">
            ${iconHtml}
            <div class="plugin-detail-info">
                <h1 class="plugin-detail-title">${escapeHtml(plugin.name)}</h1>
                <div class="plugin-detail-meta">
                    v${escapeHtml(plugin.version)} · ${escapeHtml(plugin.platform)} · by ${escapeHtml(plugin.author)}
                </div>
                <div class="plugin-detail-actions">
                    ${buttons.join('')}
                </div>
            </div>
        </div>

        <div class="tabs">
            <button class="tab-btn active" data-tab="intro">插件介绍</button>
            <button class="tab-btn" data-tab="screenshots">插件效果</button>
            <button class="tab-btn" data-tab="changelog">更新记录</button>
        </div>

        <div class="tab-panel active" data-panel="intro">
            ${readmeHtml}
        </div>

        <div class="tab-panel" data-panel="screenshots">
            <div class="screenshots">${screenshotsHtml}</div>
        </div>

        <div class="tab-panel" data-panel="changelog">
            ${changelogHtml}
        </div>
    `;

    // ===== 绑定 Tab 切换 =====
    bindTabs();

    // ===== 代码高亮 =====
    if (window.hljs) {
        container.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
    }

    // ===== 灯箱 =====
    bindLightbox();
}

// 加载并渲染 markdown 文件
async function loadMarkdown(path) {
    if (!path) {
        return '<div class="empty">暂无内容</div>';
    }
    try {
        const res = await fetch(path);
        if (!res.ok) {
            return '<div class="empty">内容加载失败</div>';
        }
        const md = await res.text();
        return `<div class="readme">${marked.parse(md)}</div>`;
    } catch (e) {
        console.warn('markdown 加载失败', path, e);
        return '<div class="empty">内容加载失败</div>';
    }
}

// Tab 切换
function bindTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;

            buttons.forEach(b => b.classList.toggle('active', b === btn));
            panels.forEach(p => p.classList.toggle('active', p.dataset.panel === target));
        });
    });
}

// 灯箱
function bindLightbox() {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    const close = document.getElementById('lightboxClose');

    document.querySelectorAll('.screenshot').forEach(el => {
        el.addEventListener('click', () => {
            img.src = el.src;
            lightbox.classList.add('active');
        });
    });

    lightbox.addEventListener('click', e => {
        if (e.target === lightbox || e.target === close) {
            lightbox.classList.remove('active');
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') lightbox.classList.remove('active');
    });
}

function showError(msg) {
    document.getElementById('pluginDetail').innerHTML =
        `<div class="empty">${escapeHtml(msg)}<br><br><a href="index.html">← 返回列表</a></div>`;
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
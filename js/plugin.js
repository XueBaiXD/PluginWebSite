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

    // 基本信息
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

    // 截图
    const screenshotsHtml = (plugin.screenshots && plugin.screenshots.length > 0)
        ? `<div class="screenshots">
            ${plugin.screenshots.map(src =>
                `<img class="screenshot" src="${escapeHtml(src)}" alt="截图" loading="lazy">`
            ).join('')}
           </div>`
        : '';

    // README
    let readmeHtml = '';
    if (plugin.readme) {
        try {
            const mdRes = await fetch(plugin.readme);
            if (mdRes.ok) {
                const md = await mdRes.text();
                readmeHtml = `<div class="readme">${marked.parse(md)}</div>`;
            }
        } catch (e) {
            console.warn('README 加载失败', e);
        }
    }

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

        ${screenshotsHtml}
        ${readmeHtml}
    `;

    // 代码高亮
    if (window.hljs) {
        container.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
        });
    }

    // 灯箱
    bindLightbox();
}

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

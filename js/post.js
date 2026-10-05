document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    const file = params.get('file');

    const container = document.getElementById('postDetail');
    const navAnnounce = document.getElementById('navAnnounce');
    const navChangelog = document.getElementById('navChangelog');

    if (!type || !file) {
        container.innerHTML = '<div class="empty">参数错误<br><br><a href="index.html">← 返回首页</a></div>';
        return;
    }

    let dir;
    if (type === 'announcements') {
        dir = 'announcements';
        if (navAnnounce) navAnnounce.classList.add('active');
    } else if (type === 'site-changelogs') {
        dir = 'site-changelogs';
        if (navChangelog) navChangelog.classList.add('active');
    } else {
        container.innerHTML = '<div class="empty">未知类型<br><br><a href="index.html">← 返回首页</a></div>';
        return;
    }

    const path = dir + '/' + file;

    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error('文件不存在');

        const md = await res.text();
        const html = marked.parse(md);

        const title = extractTitle(md, stripExt(file));
        document.title = title + ' - XueBaiXD';

        container.innerHTML = `<div class="readme">${html}</div>`;

        if (window.hljs) {
            container.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="empty">内容加载失败<br><br><a href="javascript:history.back()">← 返回</a></div>';
    }
});

function extractTitle(md, fallback) {
    const m = md.match(/^#\s+(.+)$/m);
    return m ? m[1].trim() : fallback;
}

function stripExt(name) {
    return name.replace(/\.md$/i, '');
}
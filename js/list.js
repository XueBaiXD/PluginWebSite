/**
 * 通用列表页脚本
 * 用于公告页和网站更新记录页
 * 通过 body 上的 data-list 属性区分：
 *   <body data-list="announcements">  → 读 data/announcements.json + announcements/ 目录
 *   <body data-list="site-changelogs"> → 读 data/site-changelogs.json + site-changelogs/ 目录
 */
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('listContainer');
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
                const div = document.createElement('div');
                div.className = 'readme';
                div.innerHTML = marked.parse(md);
                container.appendChild(div);
            } catch (e) {
                console.warn('加载失败', path, e);
            }
        }

        if (window.hljs) {
            container.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
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
        return { json: 'announcements.json', dir: 'announcements' };
    }
    if (type === 'site-changelogs') {
        return { json: 'site-changelogs.json', dir: 'site-changelogs' };
    }
    return null;
}

function compareNames(a, b) {
    const nameA = a.replace(/\.md$/i, '');
    const nameB = b.replace(/\.md$/i, '');
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
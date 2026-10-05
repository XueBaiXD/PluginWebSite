/**
 * 主题切换 + 鼠标拖尾 + 移动端汉堡菜单
 */
(function () {

    // =====================================================
    // 主题定义
    // =====================================================
    const THEMES = {
        blue:   { name: '星夜蓝' },
        purple: { name: '幻紫' },
        green:  { name: '翠竹' },
        orange: { name: '橙霞' },
        pink:   { name: '玫红' },
        cyan:   { name: '天青' },
        light:  { name: '白昼' }
    };

    const STORAGE_KEY = 'bairplay-theme';
    const ALL_CLASSES = Object.keys(THEMES).map(k => 'theme-' + k);

    function applyTheme(key) {
        if (!THEMES[key]) key = 'blue';

        const root = document.documentElement;
        ALL_CLASSES.forEach(c => root.classList.remove(c));
        root.classList.add('theme-' + key);

        try {
            localStorage.setItem(STORAGE_KEY, key);
        } catch (e) {}

        document.querySelectorAll('.theme-option').forEach(el => {
            el.classList.toggle('active', el.dataset.theme === key);
        });
    }

    function initTheme() {
        let saved = 'blue';
        try {
            saved = localStorage.getItem(STORAGE_KEY) || 'blue';
        } catch (e) {}
        applyTheme(saved);

        document.querySelectorAll('.theme-option').forEach(el => {
            el.addEventListener('click', () => applyTheme(el.dataset.theme));
        });

        const toggle = document.getElementById('themeToggle');
        const menu = document.getElementById('themeMenu');
        if (toggle && menu) {
            toggle.addEventListener('click', e => {
                e.stopPropagation();
                menu.classList.toggle('show');
            });

            document.addEventListener('click', () => menu.classList.remove('show'));
            menu.addEventListener('click', e => e.stopPropagation());

            document.addEventListener('keydown', e => {
                if (e.key === 'Escape') menu.classList.remove('show');
            });
        }
    }

    // =====================================================
    // 移动端汉堡菜单
    // =====================================================
    function initNavToggle() {
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.getElementById('navLinks');

        if (!navToggle || !navLinks) return;

        navToggle.addEventListener('click', e => {
            e.stopPropagation();
            navLinks.classList.toggle('show');
            navToggle.classList.toggle('active');
        });

        // 点击链接后收起
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('show');
                navToggle.classList.remove('active');
            });
        });

        // 点击外部收起
        document.addEventListener('click', () => {
            navLinks.classList.remove('show');
            navToggle.classList.remove('active');
        });

        navLinks.addEventListener('click', e => e.stopPropagation());

        // Esc 收起
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                navLinks.classList.remove('show');
                navToggle.classList.remove('active');
            }
        });

        // 屏幕变宽时自动收起
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navLinks.classList.remove('show');
                navToggle.classList.remove('active');
            }
        });
    }

    // =====================================================
    // 鼠标拖尾
    // =====================================================
    function initCursorTrail() {
        const canvas = document.getElementById('cursorTrail');
        if (!canvas) return;

        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        // 触屏设备跳过
        if ('ontouchstart' in window && !window.matchMedia('(pointer: fine)').matches) {
            return;
        }

        const ctx = canvas.getContext('2d');
        const particles = [];
        const MAX_PARTICLES = 150;

        let mouseX = -1000, mouseY = -1000;
        let lastX = -1000, lastY = -1000;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        document.addEventListener('mouseleave', () => {
            mouseX = -1000;
            mouseY = -1000;
            lastX = -1000;
            lastY = -1000;
        });

        function getPrimaryColor() {
            const v = getComputedStyle(document.documentElement)
                .getPropertyValue('--primary').trim();
            return v || '#4a9eff';
        }

        function spawn(x, y) {
            if (particles.length >= MAX_PARTICLES) return;
            const color = getPrimaryColor();
            const count = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: x + (Math.random() - 0.5) * 10,
                    y: y + (Math.random() - 0.5) * 10,
                    vx: (Math.random() - 0.5) * 1.2,
                    vy: (Math.random() - 0.5) * 1.2 - 0.4,
                    life: 1.0,
                    decay: 0.018 + Math.random() * 0.015,
                    size: 1.5 + Math.random() * 3,
                    color
                });
            }
        }

        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const dx = mouseX - lastX;
            const dy = mouseY - lastY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (mouseX > 0 && dist > 4) {
                spawn(mouseX, mouseY);
                lastX = mouseX;
                lastY = mouseY;
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.02;
                p.life -= p.decay;
                p.size *= 0.985;

                if (p.life <= 0 || p.size < 0.2) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.globalAlpha = p.life * 0.85;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1;
            requestAnimationFrame(loop);
        }

        loop();
    }

    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initNavToggle();
        initCursorTrail();
    });

})();
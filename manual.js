document.addEventListener('DOMContentLoaded', function () {
    const manualPages = Array.from(document.querySelectorAll('.manual-a4'));
    if (!manualPages.length) return;

    manualPages.forEach((pg, idx) => {
        const numEl = pg.querySelector('.manual-page-number');
        if (numEl) numEl.textContent = String(idx + 1).padStart(2, '0');
        pg.dataset.pageIndex = idx + 1;
        // make pages focusable for programmatic focus
        if (!pg.hasAttribute('tabindex')) pg.setAttribute('tabindex', '-1');
    });

    function goToPageIndex(targetIndex) {
        const target = manualPages[targetIndex];
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // focus after a short delay so keyboard users see focus
        setTimeout(() => { try { target.focus(); } catch (e) {} }, 300);
    }

    document.querySelectorAll('.manual-page-prev').forEach(btn => {
        btn.addEventListener('click', function () {
            const pg = btn.closest('.manual-a4');
            if (!pg) return;
            const idx = manualPages.indexOf(pg);
            if (idx > 0) goToPageIndex(idx - 1);
        });
    });

    document.querySelectorAll('.manual-page-next').forEach(btn => {
        btn.addEventListener('click', function () {
            const pg = btn.closest('.manual-a4');
            if (!pg) return;
            const idx = manualPages.indexOf(pg);
            if (idx < manualPages.length - 1) goToPageIndex(idx + 1);
        });
    });

    // Update visible page indicator and active class on scroll
    let current = -1;
    function update() {
        let nearest = 0, nearestDist = Infinity;
        manualPages.forEach((p, i) => {
            const rect = p.getBoundingClientRect();
            const dist = Math.abs(rect.top);
            if (dist < nearestDist) { nearestDist = dist; nearest = i; }
        });
        if (nearest !== current) {
            current = nearest;
            manualPages.forEach((p, i) => {
                p.classList.toggle('manual-a4--active', i === current);
                const num = p.querySelector('.manual-page-number');
                if (num) num.textContent = String(i + 1).padStart(2, '0');
            });
        }
    }
    let t;
    document.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(update, 120); }, { passive: true });
    // run once
    update();

    // keyboard left/right navigation
    document.addEventListener('keydown', function (ev) {
        if (ev.key === 'ArrowLeft') { if (current > 0) goToPageIndex(current - 1); }
        if (ev.key === 'ArrowRight') { if (current < manualPages.length - 1) goToPageIndex(current + 1); }
    });
});

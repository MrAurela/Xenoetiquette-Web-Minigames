
const correctSpecies = 'poppabingks';
const correctFaction = 'amazing future';
const correctChoiceIndex = 1; // option B

function normalize(s) { return (s || '').trim().toLowerCase(); }

function markInput(el, ok) {
    el.classList.remove('exam-input--idle', 'exam-input--correct', 'exam-input--wrong');
    el.classList.add(ok ? 'exam-input--correct' : 'exam-input--wrong');
}

function markChoice(btn, ok) {
    btn.classList.remove('exam-choice--idle', 'exam-choice--correct', 'exam-choice--wrong');
    btn.classList.add(ok ? 'exam-choice--correct' : 'exam-choice--wrong');
}

function clearChoiceSelection(choices) {
    choices.forEach(c => {
        c.classList.remove('exam-choice--selected');
        if (!c.classList.contains('exam-choice--correct') && !c.classList.contains('exam-choice--wrong')) {
            c.classList.add('exam-choice--idle');
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const inputs = Array.from(document.querySelectorAll('.exam-input'));
    const speciesInput = inputs[0];
    const factionInput = inputs[1];

    const choiceButtons = Array.from(document.querySelectorAll('.exam-choice'));
    // make choices selectable
    choiceButtons.forEach((btn, idx) => {
        btn.addEventListener('click', function () {
            clearChoiceSelection(choiceButtons);
            btn.classList.remove('exam-choice--idle');
            btn.classList.add('exam-choice--selected');
            // store selection on container
            btn.dataset.selected = '1';
            choiceButtons.forEach((b, i) => { if (b !== btn) delete b.dataset.selected; });
        });
    });

    const submit = document.getElementById('exam-submit');
    const banner = document.getElementById('exam-banner');
    const shareButton = document.getElementById('manual-share-toggle');
    const qrModal = document.getElementById('manual-qr-modal');
    const qrCloseBtn = document.getElementById('manual-qr-close');
    const qrContainer = document.getElementById('manual-qr-code');
    const copyButton = document.getElementById('copy-manual-link');
    const manualUrl = new URL('./manual.html', window.location.href).href;
    const manualUrlShare = 'https://mraurela.github.io/Xenoetiquette-Web-Minigames/manual.html';

    function openQrModal() {
        if (qrModal) {
            qrModal.classList.remove('hidden');
        }
        if (qrContainer) {
            qrContainer.innerHTML = '';
        }
        generateQR(manualUrlShare);
    }

    if (qrCloseBtn && qrModal) {
        qrCloseBtn.addEventListener('click', function () {
            qrModal.classList.add('hidden');
        });
    }

    if (qrModal) {
        qrModal.addEventListener('click', function (event) {
            if (event.target === qrModal) {
                qrModal.classList.add('hidden');
            }
        });
    }

    if (shareButton) {
        shareButton.addEventListener('click', async () => {
            try {
                await navigator.share(manualUrlShare);
            } catch (err) {
                openQrModal();
            }
        });
    }

    if (copyButton) {
        copyButton.addEventListener('click', function () {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(manualUrlShare).then(function () {
                    const original = copyButton.textContent;
                    copyButton.textContent = 'Copied!';
                    setTimeout(function () { copyButton.textContent = original; }, 1500);
                }).catch(function () {
                    window.alert('Unable to copy link.');
                });
            } else {
                window.prompt('Copy this manual link:', manualUrl);
            }
        });
    }

    // Manual page navigation (prev/next within each A4 header)
    const manualPages = Array.from(document.querySelectorAll('.manual-a4'));
    if (manualPages.length) {
        manualPages.forEach((pg, idx) => {
            // ensure page number display
            const numEl = pg.querySelector('.manual-page-number');
            if (numEl) numEl.textContent = String(idx + 1).padStart(2, '0');
            pg.dataset.pageIndex = idx + 1;
        });

        document.querySelectorAll('.manual-page-prev').forEach(btn => {
            btn.addEventListener('click', function (ev) {
                const pg = btn.closest('.manual-a4');
                if (!pg) return;
                const idx = manualPages.indexOf(pg);
                if (idx > 0) manualPages[idx - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        document.querySelectorAll('.manual-page-next').forEach(btn => {
            btn.addEventListener('click', function (ev) {
                const pg = btn.closest('.manual-a4');
                if (!pg) return;
                const idx = manualPages.indexOf(pg);
                if (idx < manualPages.length - 1) manualPages[idx + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        // update current page indicator when scrolling
        let currentPage = -1;
        function updateCurrentPage() {
            let nearest = 0; let nearestDist = Infinity;
            manualPages.forEach((p, i) => {
                const rect = p.getBoundingClientRect();
                const dist = Math.abs(rect.top);
                if (dist < nearestDist) { nearestDist = dist; nearest = i; }
            });
            if (nearest !== currentPage) {
                currentPage = nearest;
                // refresh numbers (keeps them accurate)
                manualPages.forEach((p, i) => {
                    const num = p.querySelector('.manual-page-number');
                    if (num) num.textContent = String(i + 1).padStart(2, '0');
                });
            }
        }
        let scrollTimeout;
        document.addEventListener('scroll', function () { clearTimeout(scrollTimeout); scrollTimeout = setTimeout(updateCurrentPage, 100); }, { passive: true });
    }

    if (!submit || !banner) {
      console.warn('Expected in-card submit button and banner elements to exist.');
      return;
    }

    banner.classList.add('bg-slate-900', 'text-white', 'shadow-lg', 'border', 'border-slate-700');
    banner.style.minHeight = '4rem';
    banner.style.padding = '1rem';
    banner.style.display = 'none';
    banner.style.alignItems = 'center';
    banner.style.justifyContent = 'center';
    banner.style.textAlign = 'center';
    banner.classList.add('hidden');

    function checkAnswers() {
        const speciesOk = normalize(speciesInput.value).includes(correctSpecies);
        const factionOk = normalize(factionInput.value).includes(correctFaction);

        markInput(speciesInput, speciesOk);
        markInput(factionInput, factionOk);

        // choice selection
        const selectedIndex = choiceButtons.findIndex(b => b.dataset.selected === '1');
        choiceButtons.forEach((btn, idx) => {
            // clear previous correctness classes
            btn.classList.remove('exam-choice--correct', 'exam-choice--wrong');
        });
        if (selectedIndex !== -1) {
            choiceButtons.forEach((btn, idx) => {
                if (idx === selectedIndex) {
                    markChoice(btn, idx === correctChoiceIndex);
                } else {
                    // dim others
                    btn.classList.remove('exam-choice--idle');
                }
            });
        }

        const allOk = speciesOk && factionOk && selectedIndex === correctChoiceIndex;
        if (allOk) {
            banner.textContent = 'Mission unlocked! Accept the mission and register now.';
            banner.classList.remove('bg-red-600', 'hidden');
            banner.classList.add('bg-emerald-600');
            banner.style.display = 'flex';

            submit.textContent = 'Accept Mission';
            submit.dataset.missionReady = 'true';
            submit.classList.add('bg-white', 'text-slate-900', 'hover:bg-slate-100');
            submit.classList.remove('bg-cyan-300', 'bg-emerald-400', 'hover:bg-emerald-300');
        } else {
            banner.textContent = 'Some answers are incorrect — try again.';
            banner.classList.remove('bg-emerald-600', 'hidden');
            banner.classList.add('bg-red-600');
            banner.style.display = 'flex';
            submit.textContent = 'Check Answers';
            submit.dataset.missionReady = 'false';
            submit.classList.add('bg-white', 'text-slate-900', 'hover:bg-slate-100');
            submit.classList.remove('bg-cyan-300', 'bg-emerald-400', 'hover:bg-emerald-300');
        }
    }

    submit.addEventListener('click', function (ev) {
        if (submit.dataset.missionReady === 'true') {
            window.location.href = 'https://www.xenoetiquette.com/register';
            return;
        }
        checkAnswers();
    });

    // allow Enter to submit when focused in inputs
    [speciesInput, factionInput].forEach(inp => {
        inp.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter') { ev.preventDefault(); checkAnswers(); }
        });
    });

    function generateQR(text) {
        const target = qrContainer || document.getElementById('qrcode');
        if (!target) return;

        const qrCode = new QRCodeStyling({
            width: 200,
            height: 200,
            data: text,
            dotsOptions: {
                color: "#000000",
                type: "square"
            },
            backgroundOptions: {
                color: "#ffffff",
            }
        });

        target.innerHTML = "";
        qrCode.append(target);
    }
});



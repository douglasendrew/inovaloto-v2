/* Toast utility: defines window.showToast and uses the template + mounts */
function ensure() {
    const defs = [
        ['tc-left-top', 'toast-container tc-left-top'],
        ['tc-left-bottom', 'toast-container tc-left-bottom'],
        ['tc-right-top', 'toast-container tc-right-top'],
        ['tc-right-bottom', 'toast-container tc-right-bottom']
    ];
    defs.forEach(([cls, full]) => {
        if (!document.querySelector('.' + cls)) {
            const d = document.createElement('div'); d.className = full; document.body.appendChild(d);
        }
    });
    if (!document.getElementById('toast-template')) {
        const t = document.createElement('template'); t.id = 'toast-template';
        t.innerHTML = '<div class="toast"><span class="dot" aria-hidden="true"></span><span class="toast-message"></span><button class="remove" aria-label="Dismiss">&times;</button></div>';
        document.body.appendChild(t);
    }
}

function showToastCustom(message, type = 'normal', duration = 5000, horizontal = 'right', vertical = 'top') {
    ensure();
    const tpl = document.getElementById('toast-template');
    const frag = tpl.content.cloneNode(true);
    const el = frag.querySelector('.toast-custom');
    const msgEl = frag.querySelector('.toast-message');
    const close = frag.querySelector('.remove');

    msgEl.textContent = String(message ?? '');
    if (type && type !== 'normal') el.classList.add(type);

    const timer = setTimeout(remove, duration);
    close.addEventListener('click', remove);

    function remove() { clearTimeout(timer); el.classList.add(horizontal === 'left' ? 'fade-out-left' : 'fade-out-right'); setTimeout(() => el.remove(), 180); }

    const target = horizontal === 'left'
        ? (vertical === 'top' ? document.querySelector('.tc-left-top') : document.querySelector('.tc-left-bottom'))
        : (vertical === 'top' ? document.querySelector('.tc-right-top') : document.querySelector('.tc-right-bottom'));

    if (vertical === 'top') {
        target.prepend(frag);
    } else {
        target.append(frag);
    }
}

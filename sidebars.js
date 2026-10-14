(function () {
    var left = document.querySelector('.sidebar-left');
    var right = document.querySelector('.sidebar-right');
    if (!left || !right) return;

    function bounceText(el) {
        var text = el.textContent;
        el.setAttribute('aria-label', text);
        el.textContent = '';
        Array.from(text).forEach(function (ch, i) {
            var s = document.createElement('span');
            s.className = 'bounce-letter';
            s.setAttribute('aria-hidden', 'true');
            s.style.animationDelay = (i * 0.08) + 's';
            s.textContent = ch;
            el.appendChild(s);
        });
    }

    var song = document.createElement('div');
    song.className = 'song-box';
    song.innerHTML = `
        <p class="song-label">My favourite song rn 🎵</p>
        <p class="song-title">Shine</p>
        <p class="song-artist">Sevendust</p>
        <a href="songlog.html" class="song-log">music corner!!</a>
    `;

    var manga = document.createElement('div');
    manga.className = 'manga-box';
    manga.innerHTML = `
        <p class="manga-label">Manga reading(s)</p>
        <p class="manga-title">Hellsing</p>
        <p class="manga-author">Kouta Hirano</p>
        <a href="manga.html" class="manga-log">manga corner!!</a>
    `;

    left.appendChild(song);
    right.appendChild(manga);

    bounceText(song.querySelector('.song-log'));
    bounceText(manga.querySelector('.manga-log'));
})();

// keep the desktop sidebars just below the logo
(function () {
    var logo = document.querySelector('.logo');
    var sidebars = document.querySelectorAll('.sidebar');
    var desktop = window.matchMedia('(min-width: 751px)');
    if (!logo || !sidebars.length) return;

    function update() {
        var top = desktop.matches
            ? Math.max(0, logo.getBoundingClientRect().bottom + 1) + 'px'
            : '';
        sidebars.forEach(function (s) { s.style.top = top; });
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
})();
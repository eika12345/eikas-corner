// Left sidebar: favourite song
(function () {
    var nav = document.querySelector('.sidebar-left');
    if (!nav) return;

    var box = document.createElement('div');
    box.className = 'song-box';
    box.innerHTML = `
        <p class="song-label">My favourite song rn 🎵</p>
        <p class="song-title">Shine</p>
        <p class="song-artist">Sevendust</p>
        <a href="songlog.html" class="song-log">music corner!!</a>
    `;
    nav.appendChild(box);
})();

// Right sidebar: favourite manga
(function () {
    var nav = document.querySelector('.sidebar-right');
    if (!nav) return;

    var box = document.createElement('div');
    box.className = 'manga-box';
    box.innerHTML = `
        <p class="manga-label">Manga reading(s)</p>
        <p class="manga-title">Hellsing</p>
        <p class="manga-author">Kouta Hirano</p>
        <a href="manga.html" class="manga-log">manga corner!!</a>
    `;
    nav.appendChild(box);
})();
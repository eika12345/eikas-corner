(function () {
    var nav = document.querySelector('.sidebar-left');
    if (!nav) return;

    var box = document.createElement('div');
    box.className = 'song-box';
    box.innerHTML = `
        <p class="song-label">My favourite song rn 🎵</p>
        <p class="song-title">Life We Live</p>
        <p class="song-artist">Project Pat</p>
        <a href="songlog.html" class="song-log">log!</a>
    `;
    nav.appendChild(box);
})();
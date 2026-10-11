(function () {
    var nav = document.querySelector('.sidebar-left');
    if (!nav) return;

    var box = document.createElement('div');
    box.className = 'song-box';
    box.innerHTML = `
        <p class="song-label">My favourite song rn 🎵</p>
        <p class="song-title">Summer Girl</p>
        <p class="song-artist">Jamiroquai</p>
        <a href="songlog.html" class="song-log">music corner!!</a>
    `;
    nav.appendChild(box);
})();
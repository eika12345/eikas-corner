const parts = {
  'site-nav-left': `
    <nav class="sidebar sidebar-left">
        <a href="home.html">Home</a>
        <a href="blog.html">Blog</a>
        <a href="jungle.html" style="color: #a4d1d3;">Alternate timeline..</a>
        <a href="gallery.html">Gallery</a>
        <a href="guestbook.html">Guestbook</a>
        <a href="links.html">Links</a>
    </nav>`,

  'site-nav-right': `
    <nav class="sidebar sidebar-right">
        <a href="https://www.instagram.com/erikas.2005/?hl=en" target="_blank">Instagram</a>
        <a href="https://github.com/eika12345" target="_blank">Dev Corner (Github)</a>
        <a href="https://erikaspetrauskas.com/" target="_blank">Portfolio</a>
        <a href="sources.html">Sources</a>
        <a href="index.html">Landing</a>
    </nav>`,

  'site-footer': `
    <footer class="footer">
        <div class="separator"></div>
        <div class="footer-content">
            <p class="footer-links">
                <a href="home.html">Home</a>
                <a href="https://www.instagram.com/erikas.2005/?hl=en" target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href="https://github.com/eika12345" target="_blank" rel="noopener noreferrer">Dev Corner</a>
                <a href="https://erikaspetrauskas.com/" target="_blank" rel="noopener noreferrer">Portfolio</a>
                <a href="sources.html">Sources</a>
                <a href="index.html">Landing</a>
            </p>
            <div id="bonki-ring"></div>
            <p class="footer-text">WELCOME TO THE BEGINNING</p>
            <p class="footer-text">Best viewed on desktop</p>
            <p class="footer-text">Made by Erikas. P</p>
        </div>
    </footer>`
};

for (const [tag, html] of Object.entries(parts)) {
  customElements.define(tag, class extends HTMLElement {
    connectedCallback() {
      const t = document.createElement('template');
      t.innerHTML = html.trim();
      this.replaceWith(t.content);   // swaps the tag for the real markup, so your CSS is unchanged

      if (tag === 'site-footer') {   // scripts inside innerHTML don't run, so add this one manually
        const s = document.createElement('script');
        s.src = 'https://bonkiscoolsite.neocities.org/bonkiring/bonkiring-widget.js';
        document.getElementById('bonki-ring').appendChild(s);
      }
    }
  });
}
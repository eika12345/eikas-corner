(function () {
    'use strict';

    var D = window.HIKING;
    if (!D) return;

    var DIFF = {
        easy:   { label: 'Easy',   color: '#caff43' },
        medium: { label: 'Medium', color: '#e9c72f' },
        hard:   { label: 'Hard',   color: '#fa6863' }
    };

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var hikes = D.hikes.slice()
        .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; })
        .map(function (h, i) { return Object.assign({}, h, { n: i + 1, id: 'hike-' + (i + 1) }); });

    var active = { easy: true, medium: true, hard: true };
    var newestFirst = true;
    var map = null, pins = null, markers = {}, editDot = null;
    var floatEl = null, floatAnchor = null;

    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function $(id) { return document.getElementById(id); }
    function num(n) { return (Math.round(n * 10) / 10).toString(); }
    function visible() { return hikes.filter(function (h) { return active[h.difficulty]; }); }

    function renderStats() {
    var km = 0, hrs = 0, count = 0, longest = null;
    hikes.forEach(function (h) {
        var t = h.times || 1;
        km += h.km * t;
        hrs += h.hours * t;
        count += t;
        if (!longest || h.km > longest.km) longest = h;
    });
    var cells = [
        ['Hikes', count],
        ['Distance', num(km) + ' km'],
        ['Time walked', num(hrs) + ' h'],
        ['Longest', longest ? num(longest.km) + ' km' : '-']
    ];
    $('hike-stats').innerHTML = cells.map(function (c) {
        return '<div class="hike-stat"><span class="hike-stat-num">' + esc(c[1]) +
               '</span><span class="hike-stat-label">' + esc(c[0]) + '</span></div>';
    }).join('');
    }

    function renderFilters() {
        $('hike-filters').innerHTML = Object.keys(DIFF).map(function (k) {
            return '<label class="hike-filter">' +
                   '<input type="checkbox" data-diff="' + k + '" checked>' +
                   '<span class="hike-swatch" style="--c:' + DIFF[k].color + '"></span>' +
                   esc(DIFF[k].label) + '</label>';
        }).join('');
        $('hike-filters').addEventListener('change', function (e) {
            var k = e.target.getAttribute('data-diff');
            if (!k) return;
            active[k] = e.target.checked;
            renderMarkers();
            renderLog();
        });
    }

    function popupHtml(h) {
    return '<div class="hk-pop">' +
           '<strong>' + esc(h.name) + '</strong>' +
           '<span>' + num(h.km) + ' km \u00b7 ' +
               (h.elevation != null ? '+' + h.elevation + ' m \u00b7 ' : '') +
               num(h.hours) + ' h</span>' +
           '<span>' + esc(DIFF[h.difficulty].label) + '</span>' +
           '<button type="button" class="hike-btn" data-jump="' + h.id + '">Read the entry</button>' +
           '</div>';
    }   

    function pct(v, total) { return (v / total * 100) + '%'; }

    function initMap() {
        var el = $('hike-map');
        el.innerHTML = '';

        el.style.aspectRatio = D.mapWidth + ' / ' + D.mapHeight;
        el.style.height = 'auto';

        var img = document.createElement('img');
        img.className = 'hike-map-img';
        img.src = D.mapImage;
        img.alt = '';
        img.draggable = false;
        img.addEventListener('load', function () {
            var want = D.mapWidth / D.mapHeight, have = img.naturalWidth / img.naturalHeight;
            if (Math.abs(want - have) / want > 0.01 && window.console) {
                console.warn('hiking map: image is ' + img.naturalWidth + 'x' + img.naturalHeight +
                    ' but hiking-data.js says ' + D.mapWidth + 'x' + D.mapHeight +
                    '. Update mapWidth/mapHeight (and re-place pins) to stop it stretching.');
            }
        });
        img.addEventListener('error', function () {
            img.style.display = 'none';
            el.insertAdjacentHTML('afterbegin',
                '<p class="hike-maperror">The map image did not load. The trail log below still works.</p>');
        });
        el.appendChild(img);

        pins = document.createElement('div');
        pins.className = 'hike-pins';
        el.appendChild(pins);
        map = el;

        window.addEventListener('resize', placeFloat);

        if (/[?&]edit(&|=|$)/.test(location.search)) {
            el.addEventListener('click', function (e) {
                if (e.target.closest('.hk-icon')) return;
                var r = img.getBoundingClientRect();
                var fx = (e.clientX - r.left) / r.width;
                var fy = (e.clientY - r.top) / r.height;
                var x = Math.round(fx * D.mapWidth);
                var y = Math.round(fy * D.mapHeight);
                if (editDot && editDot.parentNode) editDot.parentNode.removeChild(editDot);
                editDot = document.createElement('span');
                editDot.className = 'hk-editdot';
                editDot.style.left = pct(fx, 1);
                editDot.style.top = pct(fy, 1);
                el.appendChild(editDot);
                openFloat(editDot, '<div class="hk-pop"><strong>x: ' + x + ', y: ' + y + '</strong></div>');
            });
        }
        renderMarkers();
    }

    function renderMarkers() {
        if (!map) return;
        closeFloat();
        pins.innerHTML = '';
        markers = {};
        visible().forEach(function (h) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'hk-icon';
            b.style.left = pct(h.x, D.mapWidth);
            b.style.top = pct(h.y, D.mapHeight);
            b.title = h.name;
            b.setAttribute('aria-label', h.name);
            b.innerHTML = '<span class="hk-pin" style="--c:' + DIFF[h.difficulty].color + '"></span>';
            b.addEventListener('click', function () { openFloat(b, popupHtml(h)); });
            pins.appendChild(b);
            markers[h.id] = b;
        });
    }

    function closeFloat() {
        if (floatEl && floatEl.parentNode) floatEl.parentNode.removeChild(floatEl);
        floatEl = null;
        floatAnchor = null;
    }

    function placeFloat() {
        if (!floatEl || !floatAnchor) return;
        if (!document.body.contains(floatAnchor)) { closeFloat(); return; }
        var r = floatAnchor.getBoundingClientRect();
        var w = floatEl.offsetWidth, h = floatEl.offsetHeight;
        var vw = document.documentElement.clientWidth;
        var cx = r.left + r.width / 2;
        var left = Math.max(8, Math.min(vw - w - 8, cx - w / 2));
        var above = r.top - h - 14;
        var up = above >= 8;
        floatEl.style.left = left + 'px';
        floatEl.style.top = (up ? above : r.bottom + 8) + 'px';
        var tip = floatEl.querySelector('.hk-float-tip');
        if (tip) {
            tip.style.display = up ? '' : 'none';
            tip.style.left = Math.max(14, Math.min(w - 14, cx - left)) + 'px';
        }
    }

    function openFloat(anchor, html) {
        closeFloat();
        if (!anchor) return;
        floatAnchor = anchor;
        floatEl = document.createElement('div');
        floatEl.className = 'hk-float';
        floatEl.innerHTML =
            '<div class="hk-float-box">' + html + '</div>' +
            '<div class="hk-float-tip"></div>' +
            '<a class="hk-float-close" href="#close" role="button" aria-label="Close">\u00d7</a>';
        floatEl.addEventListener('click', function (e) {
            if (e.target.closest('.hk-float-close')) {
                e.preventDefault();
                closeFloat();
                return;
            }
            var j = e.target.closest('[data-jump]');
            if (j) {
                var target = j.getAttribute('data-jump');
                closeFloat();
                jumpTo(target);
            }
        });
        document.body.appendChild(floatEl);
        placeFloat();
    }

    document.addEventListener('pointerdown', function (e) {
        if (!floatEl) return;
        if (floatEl.contains(e.target)) return;
        if (e.target.closest && e.target.closest('.hk-icon')) return;
        closeFloat();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeFloat();
    });
    document.addEventListener('scroll', placeFloat, true);

    /* ---------- trail log ---------- */
   function renderLog() {
    var list = visible().slice();
    list.sort(function (a, b) { return newestFirst ? b.n - a.n : a.n - b.n; });
    var el = $('hike-log');
    if (!list.length) {
        el.innerHTML = '<p class="hike-empty">Nothing matches the filters. Tick a difficulty above.</p>';
        return;
    }
    el.innerHTML = list.map(function (h) {
        var d = DIFF[h.difficulty];
        return '<article class="hike-entry" id="' + h.id + '" style="--c:' + d.color + '">' +
            '<header class="hike-entry-head">' +
                '<h3>' + esc(h.name) + '</h3>' +
            '</header>' +
            '<p class="hike-entry-meta">' +
                num(h.km) + ' km \u00b7 ' +
                (h.elevation != null ? '+' + h.elevation + ' m \u00b7 ' : '') +
                num(h.hours) + ' h \u00b7 ' +
                '<span class="hike-diff">' + esc(d.label) + '</span>' +
            '</p>' +

            '<div class="hike-entry-body">' +
                '<p class="hike-entry-note">' + esc(h.note) + '</p>' +
                (h.photo
                    ? '<div class="hike-entry-photo"><img src="' + esc(h.photo) + '" alt="' + esc(h.alt || h.name) + '" loading="lazy"></div>'
                    : '') +
            '</div>' +

            (map ? '<button type="button" class="hike-btn" data-show="' + h.id + '">Show on map</button>' : '') +
            '</article>';
    }).join('');
}

    function byId(id) { return hikes.filter(function (h) { return h.id === id; })[0]; }

    function showOnMap(id) {
        var h = byId(id), m = markers[id];
        if (!h || !m || !map) return;
        $('hike-map').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        openFloat(m, popupHtml(h));
    }

    function jumpTo(id) {
        var el = $(id);
        if (!el) return;
        el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        el.classList.remove('hike-flash');
        void el.offsetWidth;
        el.classList.add('hike-flash');
    }

    /* ---------- best / worst ---------- */
    function renderSuperlatives() {
        var el = $('hike-superlatives');
        if (hikes.length < 2) { el.parentNode.parentNode.style.display = 'none'; return; }
        var best = hikes[0], worst = hikes[0];
        hikes.forEach(function (h) {
            if (h.rating > best.rating || (h.rating === best.rating && h.km > best.km)) best = h;
            if (h.rating < worst.rating || (h.rating === worst.rating && h.km > worst.km)) worst = h;
        });
        function card(label, h) {
            return '<div class="hike-super-card" style="--c:' + DIFF[h.difficulty].color + '">' +
                '<span class="hike-super-label">' + label + '</span>' +
                '<strong>' + esc(h.name) + '</strong>' +
                '<span>' + num(h.km) + ' km</span>' +
                (map ? '<button type="button" class="hike-btn" data-show="' + h.id + '">Show on map</button>' : '') +
                '</div>';
        }
        el.innerHTML = card('Best hike', best) + card('Worst hike', worst);
    }

    function fillList(id, items, fn) {
        var el = $(id);
        if (!el) return;
        el.innerHTML = (items || []).map(fn).join('');
    }
    function renderLists() {
        fillList('hike-bucket', D.bucket, function (b) {
            return '<li class="' + (b.done ? 'done' : '') + '">' + esc(b.text) + '</li>';
        });
    }

    document.addEventListener('click', function (e) {
        var s = e.target.closest && e.target.closest('[data-show]');
        if (s) showOnMap(s.getAttribute('data-show'));
    });

    renderStats();
    renderFilters();
    initMap();
    renderSuperlatives();
    renderLog();
    renderLists();
})();
const pt = new POSTreq.POSTreq();
window.fetch = pt.getPolyfill();


const SUPABASE_URL = "https://bpyptntobxvytbdxmnao.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJweXB0bnRvYnh2eXRiZHhtbmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NjgxNDQsImV4cCI6MjEwNDQ0NDE0NH0.Cjo5DyNFqij2akmH5Emv42nHLE6DOb2fnE7zAoTreFw";

const TABLE_ENDPOINT = `${SUPABASE_URL}/rest/v1/guestbook`;

const form = document.getElementById("guestbook-form");
const statusEl = document.getElementById("gb-status");
const entriesEl = document.getElementById("guestbook-entries");
const submitBtn = form.querySelector("button[type=submit]");


submitBtn.disabled = true;
statusEl.textContent = "connecting...";


function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(iso) {
    const d = new Date(iso);
    const date = d.toLocaleDateString("en-GB");
    const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    return `${date} - ${time}`;
}

async function loadEntries() {
    try {
        const res = await fetch(`${TABLE_ENDPOINT}?select=*&order=created_at.desc`, {
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (!res.ok) throw new Error(`Failed to load entries (${res.status})`);

        const entries = await res.json();
        renderEntries(entries);
    } catch (err) {
        entriesEl.innerHTML = `<p class="gb-error">couldn't load the guestbook right now.</p>`;
        console.error(err);
    }
}

function renderEntries(entries) {
    if (!entries.length) {
        entriesEl.innerHTML = `<p class="gb-empty">no one's signed yet — be the first.</p>`;
        return;
    }

    entriesEl.innerHTML = entries.map(entry => `
        <article class="entry gb-entry">
            <p class="entry-date">${formatDate(entry.created_at)}</p>
            <h2 class="entry-title">${escapeHTML(entry.name)}</h2>
            <div class="entry-body">
                <p>${escapeHTML(entry.message)}</p>
            </div>
        </article>
    `).join("");
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const message = form.message.value.trim();
    if (!name || !message) return;

    submitBtn.disabled = true;
    statusEl.textContent = "signing...";

    try {
        const res = await fetch(TABLE_ENDPOINT, {
            method: "POST",
            headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal"
            },
            body: JSON.stringify({ name, message })
        });

        if (!res.ok) throw new Error(`Failed to submit (${res.status})`);

        form.reset();
        statusEl.textContent = "thanks for signing!";
        loadEntries();
    } catch (err) {
        statusEl.textContent = "something went wrong — try again.";
        console.error(err);
    } finally {
        submitBtn.disabled = false;
    }
});

pt.onLoad = () => {
    submitBtn.disabled = false;
    statusEl.textContent = "";
    loadEntries();
};
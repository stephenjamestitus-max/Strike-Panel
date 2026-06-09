# StrikePanel™ — Funnel Fixes (plug the leaks before you drive traffic)
### Your app already has the backend (`email-signup`, `trial`, `purchase-webhook`, `checkin`). These are the wiring jobs.

---

## 1. The bio link (THIS is why you have 0 clicks)

Replace your bio's last line with a **single UTM-tagged demo link** (so clicks finally show up in analytics):

**Bio:**
```
StrikePanel™ ⚡ Coaching command center for fight teams
🥊 Daily readiness · weight cut · fight-camp timelines
🎯 Know who to push. Know who to protect.
👇 14-day demo — no signup
```
**Link field:** `https://strikepanel.uk/demo?utm_source=instagram&utm_medium=bio&utm_campaign=launch`

**Per-channel UTM links** (use the right one everywhere so you know what works):
| Place | Link |
|---|---|
| IG bio | `…/demo?utm_source=instagram&utm_medium=bio&utm_campaign=launch` |
| IG Story sticker | `…/demo?utm_source=instagram&utm_medium=story` |
| DMs | `…/demo?utm_source=instagram&utm_medium=dm` |
| Reddit | `…/demo?utm_source=reddit&utm_medium=post` |
| Lead magnet | `…/demo?utm_source=leadmagnet&utm_medium=pdf` |

**Use the IG Story Link sticker every single time you post a story.** It's available to all accounts now (no 10k requirement) and it's your highest-intent click source.

---

## 2. Email capture on the demo (turn anonymous visitors into a list)

Your `/api/email-signup` route accepts `POST { email }` and stores it in Supabase. Capture **every** demo visitor so a non-buyer today is still a lead you can nurture (you have the `email-sequence` skill ready).

**Drop-in inline form** (matches the POST shape exactly — add near the demo CTA):
```html
<form id="sp-capture" style="display:flex;gap:8px;max-width:420px">
  <input id="sp-email" type="email" required placeholder="Email for your free fight-camp checklist"
    style="flex:1;padding:12px 14px;border-radius:10px;border:1px solid #00D4F0;background:#0b0d14;color:#fff">
  <button style="padding:12px 18px;border:0;border-radius:10px;background:#00D4F0;color:#04070f;font-weight:700;cursor:pointer">Get it</button>
</form>
<p id="sp-capture-msg" style="font-size:13px;color:#9fb3c8;margin-top:8px"></p>
<script>
document.getElementById('sp-capture').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('sp-email').value;
  const msg = document.getElementById('sp-capture-msg');
  msg.textContent = 'Sending…';
  try {
    const r = await fetch('/api/email-signup', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email })
    });
    const d = await r.json();
    msg.textContent = d.ok ? '✅ Check your inbox — checklist on its way.' : (d.msg || 'Try again.');
    if (d.ok) document.getElementById('sp-capture').reset();
  } catch { msg.textContent = 'Network error — try again.'; }
});
</script>
```
> Tip: add an optional `source` field to the body (`{ email, source: 'demo' }`) and extend the route so you can tell demo signups from landing signups. (The route currently hardcodes `source: 'landing'`.)

---

## 3. Social proof (your single biggest conversion lever — you have ZERO right now)

A $99 coach tool with no testimonials converts near 0%. Fix it in week 1:

**The ask (DM to your first 5 triallers / friendly coaches):**
```
Hey [name] — giving StrikePanel free to 5 coaches I respect in exchange for
one honest line about it + your gym name/handle. No essay — even "finally
something that isn't a spreadsheet" works. Cool if I put it on the site?
```

**Landing-page testimonial block** (drop under the hero):
```html
<section style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin:40px 0">
  <!-- repeat per coach -->
  <blockquote style="background:#0b0d14;border:1px solid rgba(0,212,240,.25);border-radius:14px;padding:20px;color:#dbe7f0">
    “Finally something that isn't a spreadsheet. I check it before every session.”
    <footer style="margin-top:12px;color:#00D4F0;font-weight:700">— Coach Name, Gym @handle</footer>
  </blockquote>
</section>
```
Even 3 real quotes will move your conversion more than any ad.

---

## 4. Deploy the lead magnet (the asset that travels where your app can't)

File: `lead-magnet-fight-camp-readiness-checklist.html` (in this folder).
- **Host it** at `strikepanel.uk/checklist` (free, it's static) OR keep it as a downloadable PDF (open in Chrome → Print → Save as PDF → it's print-styled).
- **Gate it lightly:** give it free in DMs/Reddit (build goodwill), or email-gate it on the demo to build your list. Both work — ungated for cold communities, gated on your own site.
- Every page footer links to the demo with `utm_source=leadmagnet`.

---

## 5. Quick wins checklist
- [ ] Bio → single UTM demo link
- [ ] Story Link sticker habit (every story)
- [ ] Email capture form on demo page (snippet above)
- [ ] DM 5 coaches for testimonials → add block to landing
- [ ] Host/share the lead magnet
- [ ] Confirm `purchase-webhook` fires a thank-you + onboarding email (you have `email-sequence` for this)

<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Supabase is the source of truth for authentication and fine records; fine reads are public while all writes remain owner-authenticated, and Firebase is used only for browser analytics.
- Self-hosting on Vercel: `vite.config.ts` pins nitro `preset: "vercel"`; Lovable builds override it with `LOVABLE_NITRO_PRESET`, so previews stay on Cloudflare. `.env` is gitignored (holds only public Supabase values) — hosts get env vars from their dashboard; see GUIA-VERCEL.md.
- Keep student and teacher reminder markup centralized in the shared email-template module so manual and scheduled sends stay visually identical.
- Keep fine-save celebrations in a shared browser component driven by the audio playback clock, so coin impacts remain synchronized even after a delayed save.
- Render the shared site footer in the root layout and give each informational document its own public route, shared document layout, and leaf metadata so links and presentation stay consistent.
- Keep the site's legal identity (titular, tax id, address, contact channels) in one shared module that every legal document imports, so the four documents never disagree and no draft placeholder survives an update.

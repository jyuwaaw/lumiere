# Contributing

New styles, better recipes and corrections are all welcome.

## Adding a style

1. Copy `styles/_template/` to `styles/<style-name>/`, using a short kebab-case name.
2. Fill in, in this order:
   - `LESSONS.md`: what went wrong and how you'd do it next time. It is the most useful file, and it's easiest to write while the project is fresh.
   - `STYLE.md`: keywords, reference films, the emotional arc, shot grammar, and the look and sound recipes.
   - `prompts/`: the exact prompts you used, with a note on how each turned out (bad ones too; mark them as counter-examples).
   - `credits.md`: every third-party asset with its licence. Check each licence on the asset's own page.
   - `template/` (optional but encouraged): code or project files that reproduce the look.
3. Add a row to the style table in `README.md` (and `README.zh.md` if you can).
4. Open a pull request with a link to a finished video made with the style.

## Rules

- **Only include assets you're allowed to redistribute.** Link to the rest by ID or URL in `credits.md`.
- **Don't commit secrets.** Signed URLs, API keys and tokens become placeholders like `<SIGNED_URL>`.
- **Be honest about results.** If a prompt didn't work, say so. If a claim in a video (math, science, history) is only partially verified, say how far.
- **Docs are English-first.** A Chinese (or any other language) version can sit alongside as `*.zh.md` and so on.

By contributing, you agree that docs are licensed under CC BY 4.0 and code under MIT, as in [LICENSE](LICENSE).

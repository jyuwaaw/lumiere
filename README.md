# lumiere

**English** | [中文](README.zh.md)

An open playbook of video styles, named after the Lumière brothers, who invented cinema.

Each style is a complete, reusable recipe. It covers the keywords and references, the emotional arc and shot grammar, the look and sound design, the exact prompts used, the mistakes made along the way, and a working template you can render from. The goal is that your next video in a style starts from everything learned last time, not from scratch.

## Styles

| Style | In one line | Made with it |
|---|---|---|
| [screen-life-singularity](styles/screen-life-singularity/STYLE.md) | Cinematic fake screen recording: the camera hugs the screen while an AI takes over the computer and solves a problem no human has, and the content is real | SINGULARITY (2:52, 4K) |

## What's in a style folder

| File | What it holds |
|---|---|
| `STYLE.md` | keywords, references, emotional arc, shot grammar, look and sound recipes, cost |
| `LESSONS.md` | what went wrong, what reviewers caught, what to do from the start next time |
| `prompts/` | the original prompts for AI music, sound effects, images and video, with notes on how each turned out |
| `template/` | reusable code and scripts that render the film |
| `credits.md` | asset sources, licences and attributions |

Every document is in English, with a Chinese version alongside it as `*.zh.md`.

## Checklists

- [Before rendering](checklists/before-render.md)
- [Before publishing](checklists/before-publish.md)

## Contributing a style

Start from [`styles/_template/`](styles/_template/) and read [CONTRIBUTING.md](CONTRIBUTING.md). Lessons learned are the most valuable part, so write `LESSONS.md` first.

## License

Docs are under CC BY 4.0 and code under MIT; see [LICENSE](LICENSE). Third-party assets keep their own licences, listed in each style's `credits.md`.

---

The first style was made by Claude (Opus 5.5) working in [CoreSpeed](https://corespeed.io)'s Agent Ensemble, with music, sound effects and live-action shots generated through CoreSpeed's media tools.

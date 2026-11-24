# Template: how to run it

> This folder is code only. The frozen assets (17 stills, 16 clips, three music cues, two voice takes, eight sound effects, the logo and the font) are in the GitHub release **`archival-fable-assets-v1`** as a self-contained package of the same code plus the assets:
>
> - `fable-v2.1.tar.gz.part00`, `.part01`, `.part02` and `fable-v2.1.tar.gz.sha256.txt`

## Requirements

- ffmpeg with libx264, Python 3 with numpy, Pillow and SciPy.
- For a bit-identical rebuild: Ubuntu 26.04.1, ffmpeg 8.0.1-3ubuntu2, Python 3.13.17, numpy 2.5.4, Pillow 13.0.0, SciPy 1.18.1. Other versions still build the film, but the bytes will differ.
- Generating new assets needs a CoreSpeed API key in `CORESPEED_API_KEY` (`tools/cs_mcp.py` calls the CoreSpeed MCP endpoint). Rebuilding the film needs no key and calls no model.

## Rebuild the film

```bash
cat fable-v2.1.tar.gz.part* > fable-v2.1.tar.gz
sha256sum -c fable-v2.1.tar.gz.sha256.txt
tar xzf fable-v2.1.tar.gz && cd fable-v2.1
./build.sh        # about 14 minutes on 8 cores
```

Don't run Python inside the unpacked folder before `build.sh`: the manifest includes the `__pycache__` files, and an import with another Python build rewrites them.

`build.sh` checks the tool versions and every asset's checksum (`MANIFEST.sha256`), mixes the sound, renders the picture in 16 chunks, encodes the clean and captioned cuts, and compares their stream hashes with `EXPECTED_STREAMS.txt`. It prints `IDENTICAL to the delivered v2.1` when they match, then the loudness and true peak.

Output: `out/corespeed-fable-v21-{clean,captions,master}.mp4` and `out/corespeed-fable-v21-cover.jpg` (frame 0).

## Make your own film in this style

| File | What to do with it |
|---|---|
| `tools/render.py` | Use as is: film look, 4:3 gate, captions, end card. Tints are in `TINTS` and `FILM`; plates with paper margins go in `PLATES` |
| `tools/beats.py`, `tools/onsets.py`, `tools/loud.py` | Use as is: beat grid, strong onsets, loudness curve |
| `tools/cs_mcp.py` | Use as is: a small client for the CoreSpeed MCP endpoint |
| `shots.py` | Keep the style prefixes and the sphere; write your own shots |
| `tools/stills.py`, `tools/vids.py`, `tools/music3.py`, `tools/vo2.py` | Templates: generate stills, clips, cues and voice takes, and write the ledgers |
| `timeline_v2.py` | Rewrite: it holds this film's shot, cue, line and effect times |
| `tools/mix_v2.py` | Keep the voice placement, ducking, film bed and loudness steps; rewrite the event part (ticks, hits, knocks) for your film |
| `build.sh` | Keep, and change the output names |

Generate in this order: `python3 tools/stills.py` (all stills, or the ids you name), review contact sheets, then `python3 tools/vids.py` for the clips, `python3 tools/music3.py` and `python3 tools/vo2.py`. Download every output at once: the media service's links expire after 7 days.

Then freeze a version: write `MANIFEST.sha256` (`sha256sum` of every asset), run `build.sh`, copy `render/streams.txt` to `EXPECTED_STREAMS.txt`, pack the folder and upload it before you announce it.

## Checking a few frames, or re-rendering a part

Run `build.sh` once first: it extracts the clip frames into `clips/frames/`.

```bash
export TIMELINE=timeline_v2
python3 tools/render.py x --frames 12,45,93,100        # writes review/f_<seconds>.png
rm -rf render/parts && python3 tools/render.py /tmp/part.mp4 --from 90 --to 106   # one range
```

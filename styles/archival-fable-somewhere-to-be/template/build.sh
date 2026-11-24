#!/usr/bin/env bash
# Rebuild "Somewhere to Be" v2.1 from the frozen assets in this folder.
# Usage: ./build.sh            (about 12 minutes on 8 cores)
# Output: out/corespeed-fable-v21-{clean,captions,master}.mp4 and out/corespeed-fable-v21-cover.jpg
set -euo pipefail
cd "$(dirname "$0")"

echo "== 1. check the environment"
want_ffmpeg="8.0.1"; want_py="3.13"; want_np="2.5.4"; want_pil="13.0.0"; want_sp="1.18.1"
have_ffmpeg=$(ffmpeg -version | head -1 | awk '{print $3}')
python3 - "$want_py" "$want_np" "$want_pil" "$want_sp" <<'EOF'
import sys, platform, numpy, PIL, scipy
want = dict(zip(["python", "numpy", "pillow", "scipy"], sys.argv[1:]))
have = {"python": platform.python_version(), "numpy": numpy.__version__, "pillow": PIL.__version__, "scipy": scipy.__version__}
for k in want:
    ok = have[k].startswith(want[k])
    print(f"   {k:7s} {have[k]:10s} {'ok' if ok else 'DIFFERENT (output may not be bit-identical) want ' + want[k]}")
EOF
case "$have_ffmpeg" in "$want_ffmpeg"*) echo "   ffmpeg  $have_ffmpeg ok";; *) echo "   ffmpeg  $have_ffmpeg DIFFERENT (want $want_ffmpeg; output may not be bit-identical)";; esac

echo "== 2. verify the frozen assets"
sha256sum --quiet -c MANIFEST.sha256 && echo "   all $(wc -l < MANIFEST.sha256) files match"

echo "== 3. extract clip frames"
for f in clips/*.mp4; do
  b=$(basename "$f" .mp4); mkdir -p "clips/frames/$b"
  ffmpeg -v error -y -i "$f" -vf "scale=1440:1080:flags=lanczos" -threads 8 -q:v 2 "clips/frames/$b/%04d.jpg"
done

echo "== 4. mix and normalise to about -15 LUFS, true peak under -1.5 dB"
mkdir -p render out
python3 tools/mix_v2.py
I=$(ffmpeg -i render/premix_v2.wav -af ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1 | awk '{print $2}')
G=$(python3 -c "print(-14.3-($I))")
ffmpeg -v error -y -i render/premix_v2.wav -af "volume=${G}dB,alimiter=limit=0.79:attack=3:release=60:level=false" \
  -ar 48000 -c:a pcm_s24le render/mix_v2.wav

echo "== 5. render the picture (clean and captioned)"
export TIMELINE=timeline_v2 CAPTIONS_FILE=render/captions_v2.json
rm -rf render/parts; python3 tools/render.py render/picture_v2_clean.mp4 --chunks 16
rm -rf render/parts; python3 tools/render.py render/picture_v2_captions.mp4 --captions --chunks 16

echo "== 6. encode the deliverables"
for v in clean captions; do
  ffmpeg -v error -y -i render/picture_v2_$v.mp4 -c:v libx264 -threads 8 -preset slow -b:v 6500k -pass 1 -passlogfile render/p2_$v -an -f null /dev/null
  ffmpeg -v error -y -i render/picture_v2_$v.mp4 -i render/mix_v2.wav -map 0:v -map 1:a -c:v libx264 -threads 8 -preset slow -b:v 6500k \
    -pass 2 -passlogfile render/p2_$v -pix_fmt yuv420p -c:a aac -b:a 256k -t 106 \
    -movflags +faststart out/corespeed-fable-v21-$v.mp4
done
ffmpeg -v error -y -i render/picture_v2_clean.mp4 -i render/mix_v2.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -t 106 \
  -movflags +faststart out/corespeed-fable-v21-master.mp4
ffmpeg -v error -y -i out/corespeed-fable-v21-clean.mp4 -frames:v 1 -q:v 1 out/corespeed-fable-v21-cover.jpg

echo "== 7. compare with the delivered v2.1 (video and audio stream hashes)"
for v in clean captions; do
  ffmpeg -v error -i out/corespeed-fable-v21-$v.mp4 -map 0 -c copy -f streamhash -hash sha256 - | sed "s|^|$v |"
done > render/streams.txt
if diff -q render/streams.txt EXPECTED_STREAMS.txt >/dev/null; then
  echo "   IDENTICAL to the delivered v2.1"
else
  echo "   streams differ from v2.1:"; diff render/streams.txt EXPECTED_STREAMS.txt || true
  echo "   (expected on a different ffmpeg/numpy/pillow; check visually and with tools/loud.py)"
fi
ffmpeg -i out/corespeed-fable-v21-clean.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E '^\s+(I|Peak):' | sed 's/^/   /'

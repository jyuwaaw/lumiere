#!/bin/bash
# Decode the audio sources into the WAV layout audio6.py expects (only needed to re-mix the soundtrack).
set -e; cd "$(dirname "$0")"
mkdir -p sfxlib/raw sfxlib/wav
# Mixkit sound effects can't be redistributed, so fetch them by ID (Mixkit free licence).
for id in 1396 2568 1143 3120 2617 2619 2574 2520 2519 3116 2669 1061 549 2507 794; do
  [ -f sfxlib/raw/$id.mp3 ] || curl -sfL -A "Mozilla/5.0" -o sfxlib/raw/$id.mp3 "https://assets.mixkit.co/active_storage/sfx/$id/$id-preview.mp3"
done
for f in sfxlib/raw/*.mp3; do ffmpeg -loglevel error -y -i "$f" -ar 48000 -ac 2 -c:a pcm_f32le "sfxlib/wav/$(basename "${f%.mp3}").wav"; done
for f in fs/*.mp3 elsfx/*.mp3; do ffmpeg -loglevel error -y -i "$f" -ar 48000 -ac 2 -c:a pcm_f32le "${f%.mp3}.wav"; done
ffmpeg -loglevel error -y -i music_dark.mp3 -ar 48000 -ac 2 -c:a pcm_f32le music_dark.wav
echo done

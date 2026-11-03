#!/bin/bash
# Decode the audio sources into the WAV layout audio6.py expects (only needed to re-mix the soundtrack).
set -e; cd "$(dirname "$0")"
mkdir -p sfxlib/wav
for f in sfxlib/raw/*.mp3; do ffmpeg -loglevel error -y -i "$f" -ar 48000 -ac 2 -c:a pcm_f32le "sfxlib/wav/$(basename "${f%.mp3}").wav"; done
for f in fs/*.mp3 elsfx/*.mp3; do ffmpeg -loglevel error -y -i "$f" -ar 48000 -ac 2 -c:a pcm_f32le "${f%.mp3}.wav"; done
ffmpeg -loglevel error -y -i music_dark.mp3 -ar 48000 -ac 2 -c:a pcm_f32le music_dark.wav
echo done

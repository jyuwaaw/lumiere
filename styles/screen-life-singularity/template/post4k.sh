#!/bin/bash
# 4K: frames4k + DOF/bloom/grain + live-action shots (upscaled) + mixed audio -> final mp4
# usage: ./post4k.sh <audio.wav> <out.mp4>
set -e
cd "$(dirname "$0")"
T24=$(python3 -c "import json;print(json.load(open('frames4k/meta.json'))['marks']['T24'])")
LIVE="scale=3870:2160:flags=lanczos,crop=3840:2160,unsharp=5:5:0.6,fps=30"
ffmpeg -loglevel error -stats -y -framerate 30 -i frames4k/f/f%05d.jpg -framerate 30 -loop 1 -i mask4k.png -i live/shotA.mp4 -i live/shotB.mp4 -i "$1" -filter_complex "
[0:v]format=gbrp,split=2[a0][b0];[b0]gblur=sigma=14[bl];[1:v]format=gbrp[m];[a0][bl][m]maskedmerge,split=2[x][y];
[y]curves=all='0/0 0.62/0 1/1',gblur=sigma=56[g];[x][g]blend=all_mode=screen:all_opacity=0.32,rgbashift=rh=-4:bh=4,vignette=angle=PI/4.6,noise=alls=5:allf=t+u,format=yuv420p[p];
[2:v]${LIVE},trim=0:4.6,setpts=PTS-STARTPTS,format=yuv420p,eq=saturation=0.92:contrast=1.04,fade=t=in:st=0:d=1.2,noise=alls=5:allf=t+u,vignette=angle=PI/4.6[la];
[3:v]trim=start=3.95,setpts=1.25*(PTS-STARTPTS),${LIVE},format=yuv420p,eq=saturation=0.92:contrast=1.04,noise=alls=5:allf=t+u,vignette=angle=PI/4.6,setpts=PTS+(${T24}-3.3)/TB[lb];
[p][la]overlay=enable='lt(t,4.6)':eof_action=pass[v1];[v1][lb]overlay=enable='between(t,${T24}-3.3,${T24})':eof_action=repeat,format=yuv420p[v]" \
 -map "[v]" -map 4:a -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:v libx264 -preset medium -crf 18 -profile:v high -level 5.1 -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart -shortest "$2"

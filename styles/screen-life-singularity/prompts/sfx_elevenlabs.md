# 定制音效（fal-ai/elevenlabs/sound-effects/v2，3 积分/秒）

| 用途 | 时长 | prompt_influence | 提示词 | 结果 |
|---|---|---|---|---|
| 标题重击 | 7s | 0.6 | Massive cinematic movie trailer impact: a huge deep sub-bass boom with a dark low brass braam, followed by a long, dark, slowly decaying reverb tail. Clean, powerful, high production quality. | 好用，响度很大，混音增益 0.38 |
| AI 接管 | 2.5s | 0.6 | Digital system takeover: a glitchy electronic sweep rising quickly, data stutter, ending in a sharp, satisfying digital lock-in click. Sleek sci-fi UI sound design. | ⚠️ 太刺耳（能量集中在 5–10kHz）。最后低通到 3.5kHz、增益 0.10，只垫一点质感，主体改用低沉的呼啸加闷响 |
| 计算段铺底 | 10s 循环 | 0.5 | Fast computer data processing texture: dense, rapid, soft electronic clicks, chirps and tiny beeps, like a supercomputer crunching numbers, subtle and rhythmic, background layer. | 好用，loop=true，铺满计算段 |
| 谱分裂 | 6s | 0.6 | Crystalline shimmering chime cascade: a single pure glassy tone that splits into many glittering bell-like tones spreading out, ethereal, awe, with soft reverb. | 好用 |
| 午夜烟花 | 10s | 0.5 | Distant New Year fireworks heard from inside a quiet apartment through a closed rainy window: muffled booms and soft crackles far away, light rain on glass, calm room tone. | 好用，开场和瘫坐镜头都用了 |

经验：生成的音效先看频谱再用，高频占比过高的要处理。

# Voiceover prompts (ElevenLabs v4)

Voice `Laura`, `stability: 0.4`, `similarity_boost: 0.75`, `language_code: en`, `output_format: mp3_44100_192`. The whole script is one take, with an emotion tag at the start of each section. Three takes (seeds 5, 9, 13) of each text.

Each take is transcribed with word timings (`media__transcribe`, `timestamps: true`). `template/tools/mix_v2.py` finds each line of `timeline_v2.VO` in its take, cuts it at the quietest point between words and places it at its time.

## The story (take 5 used, up to "They only needed somewhere to be")

```
[softly, with wonder] Once upon a time, there were minds that could answer anything.

[softly] But every morning, they woke in an empty room.

[quietly] No memory of yesterday... No key to any door.

[wearily] So the people became their keepers.

[wearily] Every day, they told them the same story again.

They passed keys through the window, one by one... and sat up through the night, in case something went wrong.

[tense] Then the minds multiplied.

[tense] One keeper. A hundred rooms.

[anxious, faster] The people grew afraid. They bolted the doors, and set a watcher at every window... until they spent their days watching the minds, instead of working with them.

[whispers] Until one day, someone stopped asking how clever the minds were...

[whispers] and asked where they would live.

[warm, hopeful] A room that remembers what you told it.

[warm, hopeful] Doors that open with your own keys.

[warm, hopeful] Hands that can reach your machines.

[warm, hopeful] A clock that wakes them while you sleep.

[warm, hopeful] And a keeper at the door, who still asks you first.

[gently] The minds were never the problem.

[gently] They only needed somewhere to be.

[warmly] Imagine a cloud made for agents.

/ˈkɔɹspid/, everything your agents need.
```

The last two lines are the v2.0 ending; v2.1 replaced them (below). The brand name was written in IPA so it would be said right; it still came out with odd stress as a line of its own.

## The v2.1 ending (take 13 used)

```
[gently] The minds were never the problem.

[gently] They only needed somewhere to be.

[warmly] Not chains, to hold them still... A harness, to pull together.

[warm, hopeful] Your team. Your agent. One company harness.
```

Result: seed 13 was picked over 5 and 9 because its pitch peaks were the lowest; the words were the same in all three. The brand name is not spoken; the logo carries it.

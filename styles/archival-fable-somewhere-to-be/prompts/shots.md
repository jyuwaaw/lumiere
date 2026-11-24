# Shot prompts

Stills: `fal-ai/nano-banana-pro`, 4:3, 2K, PNG. Clips: `minimax/h3-max/image-to-video` from the still, 6 s, 768P, `prompt_expansion_mode: balanced`.
Every clip prompt is the motion below followed by: *Keep the look of a 1970s 16mm documentary film: soft, grainy, natural light, realistic, subtle motion. No text.*
The same text lives in `template/shots.py`; the job ids are in `template/stills/ledger.json` and `template/clips/ledger.json`.

## Style prefixes

**ENGRAVING**

> A 19th-century steel engraving, scanned from an old book plate: fine black ink cross-hatching and stipple on aged off-white paper, monochrome, no color, no text, no captions, no signature. The engraving fills the entire frame edge to edge, a full-bleed crop inside the plate: no paper margins, no paper edges, no frame line, no border.

**ENGRAVING (blue ink)**: the same, with *deep blue ink on cream paper* instead of *monochrome, no color* (star chart, cloud plate).

**FILM**

> A single frame from a 1970s 16mm documentary film, shot on Kodak Ektachrome: soft focus, visible film grain, faded natural colors, gentle halation, natural light, no text, no people facing camera. Full-frame image edge to edge: no borders, no sprocket holes, no film edges, no date stamp, no timestamp, no letters or numbers anywhere.

**The sphere** (the recurring character, the same words everywhere): *a small, softly glowing sphere of light about the size of a lantern, floating, with a gentle halo*

## Shots

### s01 · still · ENGRAVING · tint `green`

A vast circular library with endless shelves of books rising into darkness. In the centre, a small, softly glowing sphere of light about the size of a lantern, floating, with a gentle halo, lights the faces of a few tiny scholars looking up at it in wonder. Wide composition, deep perspective.

### s02 · still · ENGRAVING · tint `sepia`

A bare, empty room with wooden floorboards and one tall window. Pale dawn light falls in a shaft across the floor. On the floor in the middle sits a small, softly glowing sphere of light about the size of a lantern, floating, with a gentle halo, alone. Nothing else in the room.

### s03 · video · FILM · tint `teal`

Close-up of an old school slate covered in neat chalk handwriting and diagrams, on a wooden desk.

Motion: A cloth enters from the left and slowly wipes the chalk writing away, leaving the slate blank. Static camera, handheld micro-shake.

### s04 · still · ENGRAVING · tint `sepia`

A long, narrow corridor lined on both sides with tall closed wooden doors, each with a large ornate keyhole and no handle. The corridor recedes to a vanishing point. Empty, silent.

### s05 · still · ENGRAVING · tint `green`

A crowd of Victorian men and women gathered close around a pedestal, gazing intently at several glowing spheres of light kept under glass bell jars. Dramatic, crowded, faces in profile, in the manner of a Hogarth or Doré crowd scene.

### s06 · video · FILM · tint `amber`

Interior, lamplight. A woman's hands holding open a large old book, reading aloud, next to a small glowing sphere of light on the table. Stacks of identical books around it.

Motion: The hands turn the page, then flip back to the first page again. The sphere glows softly. Slow push-in.

### s07 · video · FILM · tint `amber`

Close-up of a small wooden window hatch in a dark wall, half open. A hand holds an old brass key at the opening. Warm light glows from inside.

Motion: The hand passes the brass key through the hatch, withdraws, then returns with another key. Static camera.

### s08 · video · FILM · tint `night`

Night interior. A person sits in a wooden chair beside a closed door, keeping watch, an oil lamp on a stool beside them, moths around the lamp. Seen from behind and to the side. Deep blue shadows, warm lamp.

Motion: The lamp flickers, moths circle it, the person's head slowly nods with tiredness. Static camera.

### s09 · video · FILM · tint `dusk`

Dusk. A large old apartment building seen from across a street, dozens of windows, all dark. Deep blue sky, telephone wires.

Motion: The windows light up one by one, warm yellow, until the whole facade glows. Static camera, slight handheld drift.

### s10 · still · ENGRAVING · tint `sepia`

An immense Piranesi-like hall of countless doors on many levels, connected by stairways and bridges. One tiny figure holding a lantern stands at the bottom, dwarfed by the scale.

### s11 · still · ENGRAVING · tint `green`

A crowd of frightened townspeople huddled together, looking up and over their shoulders into darkness, faces anxious, some clutching lanterns. Night, heavy shadows.

### s12 · still · ENGRAVING · tint `red`

The facade of a tall old building at night. Every window has iron bars, and at every window stands a watchman holding a lantern, staring out. Heavy bolted doors at the bottom. Symmetrical frontal view.

### s13 · still · ENGRAVING · tint `teal`

A round watchtower in the centre of a circular courtyard, ringed by tiers of small rooms with glowing spheres of light inside. Watchers in the tower peer out at every room through narrow slits.

### s14 · video · FILM · tint `golden`

Golden hour. A person seen from behind, standing still in a field of tall dry grass on a hillside, holding a small lantern at their side, looking toward a small empty house on the hill.

Motion: The person begins to walk slowly up the hill toward the house. Wind moves the grass. Handheld, following.

### s15 · video · FILM · tint `golden`

Blue hour. A small old house alone on a hill against a fading sky, its single window dark.

Motion: A warm light slowly comes on in the window and glows brighter. Static camera, gentle film flicker.

### s16 · still · ENGRAVING (blue ink) · tint `blue`

An antique celestial star chart: hundreds of stars connected by fine lines into intricate constellations that form a vast web, like a map of memory. Circular plate, delicate engraved grid.

### s17 · video · FILM · tint `warm`

A long row of old wooden doors along a sunlit corridor, all closed.

Motion: The nearest door on the right swings wide open toward the camera, then the next doors open one after another down the corridor, warm golden light flooding out of each doorway onto the floor. Clear, visible door motion. Static camera.

Result: The first motion prompt ("The doors swing open one after another down the corridor, each spilling warm light.") gave doors that barely moved. This rewrite, naming the nearest door and asking for clear, visible motion, worked.

### s18 · video · FILM · tint `teal`

A 1960s laboratory: a mechanical remote manipulator hand made of steel reaching toward a panel of old switches and dials on a computer console. Fluorescent light.

Motion: The mechanical hand reaches out and gently flips a switch; a small lamp on the console lights up. Slow push-in.

### s19 · video · FILM · tint `night`

Night. Close-up of the brass gears and dial of an old astronomical clock with a plain moon-phase disc (no face drawn on it), moonlight through a window.

Motion: The gears turn slowly, the hand reaches the hour, and a warm light comes on behind the dial. Static camera.

### s20 · video · FILM · tint `amber`

Close-up of a closed old wooden door with a brass handle, warm light under the door.

Motion: A hand gently knocks twice on the door and waits. Static camera.

Result: The clip has three knocks, not two; their contact frames (60, 67, 73) were measured and the knock sounds placed on them.

### s21 · still · ENGRAVING · tint `green`

Close view of a small, softly glowing sphere of light about the size of a lantern, floating, with a gentle halo, floating at the centre of the frame, rays and fine engraved light lines around it, on a dark cross-hatched background. Quiet, like a moon in an old astronomy book.

### s22 · still · ENGRAVING · tint `sepia`

The same bare room with one tall window as before, but now it is a lived-in study: shelves of books, a desk with papers and instruments, a plant, the window open to a garden. a small, softly glowing sphere of light about the size of a lantern, floating, with a gentle halo rests on the desk, warm and at home.

### s23 · video · FILM · tint `blue`

Looking up at a big sky of soft cumulus clouds at golden hour, sun hidden behind a cloud edge.

Motion: Time-lapse: the clouds drift and billow, light shifts. Camera slowly tilts up.

Result: Cut in v2.1 with the cloud imagery. Worked as a shot.

### s24 · still · ENGRAVING (blue ink) · tint `blue`

A vast sky of engraved billowing clouds above a distant engraved mountain range. In the upper middle of the sky, a luminous ring of light, like a gentle eclipse halo, glows through the clouds. Lots of calm empty sky in the centre.

Result: Cut in v2.1 with the cloud imagery. Worked as a shot.

### e1 · video · FILM · tint `golden`

Close-up in warm lamplight: two human hands buckling a worn brown leather harness strap with a brass buckle. Hanging from the harness's brass ring, a small, softly glowing sphere of light about the size of a lantern, floating, with a gentle halo, lighting the hands. Shallow depth of field, dark background.

Motion: The hands pull the leather strap through the brass buckle and fasten it tight, then give the harness one firm tug. The glowing sphere of light behind them sways gently and grows a little brighter. Static camera, shallow focus.

Result: v2.1 ending. Worked first time.

### e2 · still · ENGRAVING · tint `endblue`

Seen from behind, a team of people and several small glowing spheres of light walk side by side along a long straight country road toward the horizon at dawn, all pulling one great wooden wagon together by a single shared harness of leather straps. The figures fill only the lower third. The upper two thirds is calm open dawn sky drawn with plain fine horizontal engraved lines: no clouds, no birds, nothing in it.

Result: v2.1 ending. The empty sky in the upper two thirds leaves room for the logo and slogan.

### n1 · video · FILM · tint `night_film`

Extreme close-up of a heavy old iron bolt on a dark wooden door, the bolt pulled open. Hard side light.

Motion: A hand slams the iron bolt shut with force, the door shudders. Quick, sharp motion. Static camera.

### n2 · still · ENGRAVING · tint `sepia`

Extreme close-up of a large ornate keyhole in a door; through the keyhole, a single wide human eye stares out, watching.

### n3 · video · FILM · tint `dusk_film`

A dark, bare room at night. One small glowing sphere of light floats in the middle.

Motion: More and more small glowing spheres of light appear one after another, multiplying until dozens fill the room. Static camera.

### n4 · still · ENGRAVING · tint `green`

A keeper slumped asleep at a cluttered desk under a single lamp, in front of a vast wall covered with hundreds of keys hanging on hooks.

### n5 · video · FILM · tint `amber_film`

Close-up of the face of an old wall clock with Roman numerals and ornate hands, in a dim room.

Motion: The clock hands spin around faster and faster, time racing. Static camera, slight flicker.

### n6 · still · ENGRAVING · tint `teal`

An endless grid of identical small windows on a vast facade, receding in every direction, and in every single window a small glowing sphere of light.

### n7 · video · FILM · tint `night_film`

A dark narrow corridor lined with closed doors at night, a lantern held at the front of frame.

Motion: Handheld camera rushes forward fast down the corridor behind the swinging lantern, doors flashing past, shaky, urgent.

### n8 · still · ENGRAVING · tint `red`

A heavy wooden door wrapped in thick iron chains, secured with an enormous padlock and several bolts. Frontal close view.

"""Shot list for 'Somewhere to Be'. kind: still (Ken Burns) or video (i2v from the still)."""

ENGRAVING = ("A 19th-century steel engraving, scanned from an old book plate: fine black ink "
             "cross-hatching and stipple on aged off-white paper, monochrome, no color, no text, "
             "no captions, no signature. The engraving fills the entire frame edge to edge, a full-bleed crop "
             "inside the plate: no paper margins, no paper edges, no frame line, no border. ")
FILM = ("A single frame from a 1970s 16mm documentary film, shot on Kodak Ektachrome: soft focus, "
        "visible film grain, faded natural colors, gentle halation, natural light, no text, "
        "no people facing camera. Full-frame image edge to edge: no borders, no sprocket holes, "
        "no film edges, no date stamp, no timestamp, no letters or numbers anywhere. ")
ORB = ("a small, softly glowing sphere of light about the size of a lantern, floating, "
       "with a gentle halo")

SHOTS = [
    # id, kind, tint, prompt, motion (for video)
    ("s01", "still", "green", ENGRAVING +
     f"A vast circular library with endless shelves of books rising into darkness. In the centre, {ORB}, "
     "lights the faces of a few tiny scholars looking up at it in wonder. Wide composition, deep perspective.", None),
    ("s02", "still", "sepia", ENGRAVING +
     f"A bare, empty room with wooden floorboards and one tall window. Pale dawn light falls in a shaft "
     f"across the floor. On the floor in the middle sits {ORB}, alone. Nothing else in the room.", None),
    ("s03", "video", "teal", FILM +
     "Close-up of an old school slate covered in neat chalk handwriting and diagrams, on a wooden desk.",
     "A cloth enters from the left and slowly wipes the chalk writing away, leaving the slate blank. Static camera, handheld micro-shake."),
    ("s04", "still", "sepia", ENGRAVING +
     "A long, narrow corridor lined on both sides with tall closed wooden doors, each with a large "
     "ornate keyhole and no handle. The corridor recedes to a vanishing point. Empty, silent.", None),
    ("s05", "still", "green", ENGRAVING +
     "A crowd of Victorian men and women gathered close around a pedestal, gazing intently at several "
     "glowing spheres of light kept under glass bell jars. Dramatic, crowded, faces in profile, "
     "in the manner of a Hogarth or Doré crowd scene.", None),
    ("s06", "video", "amber", FILM +
     "Interior, lamplight. A woman's hands holding open a large old book, reading aloud, next to a small "
     "glowing sphere of light on the table. Stacks of identical books around it.",
     "The hands turn the page, then flip back to the first page again. The sphere glows softly. Slow push-in."),
    ("s07", "video", "amber", FILM +
     "Close-up of a small wooden window hatch in a dark wall, half open. A hand holds an old brass key at the opening. "
     "Warm light glows from inside.",
     "The hand passes the brass key through the hatch, withdraws, then returns with another key. Static camera."),
    ("s08", "video", "night", FILM +
     "Night interior. A person sits in a wooden chair beside a closed door, keeping watch, an oil lamp on a "
     "stool beside them, moths around the lamp. Seen from behind and to the side. Deep blue shadows, warm lamp.",
     "The lamp flickers, moths circle it, the person's head slowly nods with tiredness. Static camera."),
    ("s09", "video", "dusk", FILM +
     "Dusk. A large old apartment building seen from across a street, dozens of windows, all dark. "
     "Deep blue sky, telephone wires.",
     "The windows light up one by one, warm yellow, until the whole facade glows. Static camera, slight handheld drift."),
    ("s10", "still", "sepia", ENGRAVING +
     "An immense Piranesi-like hall of countless doors on many levels, connected by stairways and bridges. "
     "One tiny figure holding a lantern stands at the bottom, dwarfed by the scale.", None),
    ("s11", "still", "green", ENGRAVING +
     "A crowd of frightened townspeople huddled together, looking up and over their shoulders into darkness, "
     "faces anxious, some clutching lanterns. Night, heavy shadows.", None),
    ("s12", "still", "red", ENGRAVING +
     "The facade of a tall old building at night. Every window has iron bars, and at every window stands a "
     "watchman holding a lantern, staring out. Heavy bolted doors at the bottom. Symmetrical frontal view.", None),
    ("s13", "still", "teal", ENGRAVING +
     "A round watchtower in the centre of a circular courtyard, ringed by tiers of small rooms with glowing "
     "spheres of light inside. Watchers in the tower peer out at every room through narrow slits.", None),
    ("s14", "video", "golden", FILM +
     "Golden hour. A person seen from behind, standing still in a field of tall dry grass on a hillside, "
     "holding a small lantern at their side, looking toward a small empty house on the hill.",
     "The person begins to walk slowly up the hill toward the house. Wind moves the grass. Handheld, following."),
    ("s15", "video", "golden", FILM +
     "Blue hour. A small old house alone on a hill against a fading sky, its single window dark.",
     "A warm light slowly comes on in the window and glows brighter. Static camera, gentle film flicker."),
    ("s16", "still", "blue", ENGRAVING.replace("monochrome, no color", "deep blue ink on cream paper") +
     "An antique celestial star chart: hundreds of stars connected by fine lines into intricate constellations "
     "that form a vast web, like a map of memory. Circular plate, delicate engraved grid.", None),
    ("s17", "video", "warm", FILM +
     "A long row of old wooden doors along a sunlit corridor, all closed.",
     "The nearest door on the right swings wide open toward the camera, then the next doors open one after another down the corridor, warm golden light flooding out of each doorway onto the floor. Clear, visible door motion. Static camera."),
    ("s18", "video", "teal", FILM +
     "A 1960s laboratory: a mechanical remote manipulator hand made of steel reaching toward a panel of old "
     "switches and dials on a computer console. Fluorescent light.",
     "The mechanical hand reaches out and gently flips a switch; a small lamp on the console lights up. Slow push-in."),
    ("s19", "video", "night", FILM +
     "Night. Close-up of the brass gears and dial of an old astronomical clock with a plain moon-phase disc (no face drawn on it), moonlight through a window.",
     "The gears turn slowly, the hand reaches the hour, and a warm light comes on behind the dial. Static camera."),
    ("s20", "video", "amber", FILM +
     "Close-up of a closed old wooden door with a brass handle, warm light under the door.",
     "A hand gently knocks twice on the door and waits. Static camera."),
    ("s21", "still", "green", ENGRAVING +
     f"Close view of {ORB}, floating at the centre of the frame, rays and fine engraved light lines around it, "
     "on a dark cross-hatched background. Quiet, like a moon in an old astronomy book.", None),
    ("s22", "still", "sepia", ENGRAVING +
     f"The same bare room with one tall window as before, but now it is a lived-in study: shelves of books, "
     f"a desk with papers and instruments, a plant, the window open to a garden. {ORB} rests on the desk, "
     "warm and at home.", None),
    ("s23", "video", "blue", FILM +
     "Looking up at a big sky of soft cumulus clouds at golden hour, sun hidden behind a cloud edge.",
     "Time-lapse: the clouds drift and billow, light shifts. Camera slowly tilts up."),
    ("s24", "still", "blue", ENGRAVING.replace("monochrome, no color", "deep blue ink on cream paper") +
     "A vast sky of engraved billowing clouds above a distant engraved mountain range. In the upper middle of the sky, "
     "a luminous ring of light, like a gentle eclipse halo, glows through the clouds. Lots of calm empty sky "
     "in the centre.", None),
]

# v2 inserts for the routine and fear montages
INSERTS = [
    # v2.1 ending (2026-11-23): chains answered by a harness
    ("e1", "video", "golden", "A single frame from a 1970s 16mm documentary film, shot on Kodak Ektachrome: soft focus, visible film grain, faded natural colors, gentle halation, natural light, no text, no people facing camera. Full-frame image edge to edge: no borders, no sprocket holes, no film edges, no date stamp, no timestamp, no letters or numbers anywhere. Close-up in warm lamplight: two human hands buckling a worn brown leather harness strap with a brass buckle. Hanging from the harness's brass ring, a small, softly glowing sphere of light about the size of a lantern, floating, with a gentle halo, lighting the hands. Shallow depth of field, dark background.",
     "The hands pull the leather strap through the brass buckle and fasten it tight, then give the harness one firm tug. The glowing sphere of light behind them sways gently and grows a little brighter. Static camera, shallow focus."),
    ("e2", "still", "endblue", 'A 19th-century steel engraving, scanned from an old book plate: fine black ink cross-hatching and stipple on aged off-white paper, monochrome, no color, no text, no captions, no signature. The engraving fills the entire frame edge to edge, a full-bleed crop inside the plate: no paper margins, no paper edges, no frame line, no border. Seen from behind, a team of people and several small glowing spheres of light walk side by side along a long straight country road toward the horizon at dawn, all pulling one great wooden wagon together by a single shared harness of leather straps. The figures fill only the lower third. The upper two thirds is calm open dawn sky drawn with plain fine horizontal engraved lines: no clouds, no birds, nothing in it.', None),
    ("n1", "video", "night_film", FILM +
     "Extreme close-up of a heavy old iron bolt on a dark wooden door, the bolt pulled open. Hard side light.",
     "A hand slams the iron bolt shut with force, the door shudders. Quick, sharp motion. Static camera."),
    ("n2", "still", "sepia", ENGRAVING +
     "Extreme close-up of a large ornate keyhole in a door; through the keyhole, a single wide human eye stares out, watching.", None),
    ("n3", "video", "dusk_film", FILM +
     "A dark, bare room at night. One small glowing sphere of light floats in the middle.",
     "More and more small glowing spheres of light appear one after another, multiplying until dozens fill the room. Static camera."),
    ("n4", "still", "green", ENGRAVING +
     "A keeper slumped asleep at a cluttered desk under a single lamp, in front of a vast wall covered with hundreds of keys hanging on hooks.", None),
    ("n5", "video", "amber_film", FILM +
     "Close-up of the face of an old wall clock with Roman numerals and ornate hands, in a dim room.",
     "The clock hands spin around faster and faster, time racing. Static camera, slight flicker."),
    ("n6", "still", "teal", ENGRAVING +
     "An endless grid of identical small windows on a vast facade, receding in every direction, and in every single window a small glowing sphere of light.", None),
    ("n7", "video", "night_film", FILM +
     "A dark narrow corridor lined with closed doors at night, a lantern held at the front of frame.",
     "Handheld camera rushes forward fast down the corridor behind the swinging lantern, doors flashing past, shaky, urgent."),
    ("n8", "still", "red", ENGRAVING +
     "A heavy wooden door wrapped in thick iron chains, secured with an enormous padlock and several bolts. Frontal close view.", None),
]

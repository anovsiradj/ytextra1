#!/usr/bin/env python3

import os
import json
import hashlib
import tempfile
from PIL import Image
from pathlib import Path

size_defaults = [16,32,48,96,128]

icons = {}
chrome_icons = {}
cwddir = Path(__file__).resolve().parent
tmpdir = Path(tempfile.gettempdir(), hashlib.md5(str(cwddir).encode('utf-8')).hexdigest())

for size in size_defaults:
	name = '%i.png' % size

	icons[size] = name
	chrome_icons[size] = 'icons/%s' % name

	back_path = Path(cwddir, 'icon_background.png')
	fore_path = Path(cwddir, 'icon_foreground.png')

	back = Image.open(back_path).resize((size,size))
	fore = Image.open(fore_path).resize((size,size))

	back.paste(fore, (0, 0), fore)

	# back.show(); break # debug
	back.save(Path(cwddir, name))


with open(Path(cwddir,'icons.json'), 'w') as file:
	file.write(json.dumps(icons))
with open(Path(cwddir,'chrome_icons.json'), 'w') as file:
	file.write(json.dumps(chrome_icons))

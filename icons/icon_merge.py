#!/usr/bin/env python3

import json
import tempfile
from pathlib import Path
from PIL import Image

tmpdir = None
with open(Path(Path(__file__).resolve().parent, '.tmpdir')) as file:
	tmpdir = file.read()

icons = None
with open(Path(Path(__file__).resolve().parent, 'icons.json')) as file:
	icons = json.loads(file.read())

for icon in icons:
	size = icon['size']
	name = icon['name']

	size = int(size)
	back_path = Path(tmpdir, name)
	fore_path = Path(Path(__file__).resolve().parent, 'icon_foreground.png')

	back = Image.open(back_path).resize((size,size))
	fore = Image.open(fore_path).resize((size,size))

	back.paste(fore, (0, 0), fore)

	# back.show(); break # debug
	back.save(Path(Path(__file__).resolve().parent, name)) # debug

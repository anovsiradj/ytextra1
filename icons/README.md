

**bikin icon-foreground**

<https://www.gimp.org/tutorials/Creating_Icons/>
<https://pillow.readthedocs.io/en/stable/>

official bilang sebaiknya ada ukuran 128x128.

kalo foreground jadi, merge:
```sh
./icon_merge.py
```


**pakai icons resmi yt**

unduh
<https://www.youtube.com/about/brand-resources/#logos-icons-colors>
lalu pilih salah satu icon persegi sebagai latar utama (disarankan yang `./social/128px/`).

lalu ubah nama filenya menjadi `./icon_background.png`

kemudian jalankan perintah:
```sh
./make.py
```

copas `./chrome_icons.json` ke `../manifest.json`

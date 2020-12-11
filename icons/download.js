#!/usr/bin/env nodejs

/* https://anovsiradj.github.io/webapp.js */
const dump = (...arguments) => Array.from(arguments).forEach(a => console.debug(a));

const os = require('os');
const fs = require('fs');
const ht = href => /^https\:/.test(href) ? https : http;
const http = require('http');
const https = require('https');
const path = require('path');
const crypto = require('crypto');

const youtube_icons = require('./youtube_icons.json');
var icons = [];
var chrome_icons = {};

const tmpdir = path.join(os.tmpdir(), crypto.createHash('md5').update(__dirname).digest("hex"));
fs.exists(tmpdir, exists => {
	if (exists) return;
	fs.mkdir(tmpdir, (err) => {
		if (err) throw err;
	});
});
fs.writeFile(path.join(__dirname, '.tmpdir'), tmpdir, err => {
	if (err) throw err;
});

/* https://stackoverflow.com/a/17676794 */
function download(size,href) {
	let name = path.basename(href);
	let dest = path.join(tmpdir, name);
	dump(dest);

	fs.exists(dest, exists => {
		if (exists) return;

		let file = fs.createWriteStream(dest);
		ht(href).get(href, resp => {
			resp.pipe(file);
			file.on('finish', () => file.close());
		});
	});

	icons.push({size: Number(size), name: name});
	chrome_icons[size] = `icons/${name}`;
}

for (let i in youtube_icons) download(size=i, href=youtube_icons[i]);

/* https://nodejs.org/en/knowledge/file-system/how-to-write-files-in-nodejs/ */
fs.writeFile(`${__dirname}/icons.json`, JSON.stringify(icons), err => {
	if (err) throw err;
});
fs.writeFile(`${__dirname}/chrome_icons.json`, JSON.stringify(chrome_icons), err => {
	if (err) throw err;
});

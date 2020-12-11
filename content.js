
var hash = 'ytextra1_' + (new Date).toISOString().replace(/[^A-Za-z0-9]/g,'');
var data = {
	scale: 1,
	rotate: 0,
	top: 0,
	left: 0,
};

var style_contents = [
	`#ytd-player .html5-video-player .html5-main-video { transform: scale(${data.scale}) rotate(${data.rotate}deg); top: ${data.top}px !important; left: ${data.left}px !important; }`,
	'#ytd-player .html5-video-player .ytp-chrome-controls .ytp-right-controls .ytextra1.ytp-button {}',
	'#ytd-player .html5-video-player .ytp-chrome-controls .ytp-right-controls .ytextra1.ytp-button input { width: 42px; position: relative; }',
];

/* https://stackoverflow.com/a/27078401 */
function throttle(callback, limit = 100) {
	var waiting = false; 
	return function () {
		if (! waiting) {
			waiting = true;
			callback.apply(this, arguments);
			setTimeout(() => (waiting = false), limit); 
		} 
	}
}

/* https://anovsiradj.github.io/webapp.js */
function dump() {
	Array.from(arguments).forEach(a => console.debug(a));
}

function ce(tagname, options = {}, callback) {
	let elem = document.createElement(tagname);

	if (callback) callback(elem);

	for (let o in options) {
		if (o in elem) {
			elem[o] = options[o];
		} else {
			o.setAttribute(o, options[o]);
		}
	}

	return elem;
}

function elem_player() {
	return document.querySelector('#ytd-player .html5-video-player'); // html5 saja
}
function elem_video() {
	return elem_player()?.querySelector('.html5-main-video');
}
function elem_controls() {
	return elem_player()?.querySelector('.ytp-chrome-controls');
}
function elem_left_controls() {
	return elem_controls()?.querySelector('.ytp-right-controls');
}

function inject_left_controls(elem) {
	dump(elem_left_controls());
	elem_left_controls()?.insertBefore(elem, elem_left_controls()?.querySelector('.ytp-subtitles-button'));
}

function create_scale_control() {
	ce('input', {
		type: 'number',
		min: 0,
		max: 10,
		step: 0.01,
		value: data.scale,
		title: 'Zoom In & Zoom Out',
	}, elem => {
		ce('div', {}, elem => {
			elem.classList.add('ytp-button', 'ytextra1');
			inject_left_controls(elem);
		}).appendChild(elem);

		elem.addEventListener('keypress', event => event.stopPropagation());
		elem.addEventListener('keydown', event => event.stopPropagation());
		elem.addEventListener('keyup', event => event.stopPropagation());
		elem.addEventListener('input', throttle(function(event) {
			event.stopPropagation();

			let value = Number(this.value);
			if (Number.isNaN(value) || value < Number(this.min)) value = data.scale;

			data.scale = value;
			update_style();
		}));
	});
}

function create_rotate_control() {
	ce('input', {
		type: 'number',
		min: -360,
		max: 360,
		step: 30,
		value: data.rotate,
		title: 'Rotate Clockwise & Opposite',
	}, elem => {
		ce('div', {}, elem => {
			elem.classList.add('ytp-button', 'ytextra1');
			inject_left_controls(elem);
		}).appendChild(elem);

		elem.addEventListener('keypress', event => event.stopPropagation());
		elem.addEventListener('keydown', event => event.stopPropagation());
		elem.addEventListener('keyup', event => event.stopPropagation());
		elem.addEventListener('input', throttle(function(event) {
			event.stopPropagation();

			let value = Number(this.value);
			if (Number.isNaN(value) || value < Number(this.min) || value > Number(this.max)) value = data.rotate;

			data.rotate = value;
			update_style();
		}));
	});
}

function create_move_control(position) {
	ce('input', {
		type: 'number',
		step: 10,
		value: data[position],
		title: `Move To ${position.toUpperCase()} & Opposite`,
	}, elem => {
		ce('div', {}, elem => {
			elem.classList.add('ytp-button', 'ytextra1');
			inject_left_controls(elem);
		}).appendChild(elem);

		elem.addEventListener('keypress', event => event.stopPropagation());
		elem.addEventListener('keydown', event => event.stopPropagation());
		elem.addEventListener('keyup', event => event.stopPropagation());
		elem.addEventListener('input', throttle(function(event) {
			event.stopPropagation();

			let value = Number(this.value);
			if (Number.isNaN(value)) value = 0;

			data[position] = value;
			update_style();
		}));
	});
}

function create_style() {
	let elem = document.head.querySelector(`#${hash}`);
	if (elem) return elem; // lewati kalau tersedia

	return ce('style', {id: hash}, elem => {
		document.head.appendChild(elem);
		style_contents.forEach(rule => elem.sheet.insertRule(rule));
	});
}

function update_style() {
	let elem = document.head.querySelector(`#${hash}`);
	let selectorText = '#ytd-player .html5-video-player .html5-main-video';

	Array
	.from(elem?.sheet?.cssRules || [])
	.forEach(rule => {
		if (rule.selectorText === selectorText) {
			rule.style.transform = `scale(${data.scale}) rotate(${data.rotate}deg)`;
			rule.style.setProperty('top', `${data.top}px`, 'important');
			rule.style.setProperty('left', `${data.left}px`, 'important');
		}
	});
}

/* kadang fungsi ini tidak terpanggil */
window.addEventListener('DOMContentLoaded', event => {
	dump('ytextra1(window.DOMContentLoaded)');
	create_style();
});

window.addEventListener("load", () => {
	dump('ytextra1(window.load)');
	create_style();

	dump(hash, elem_player(), elem_controls(), elem_left_controls());

	create_rotate_control();
	create_move_control('left');
	create_move_control('top');
	create_scale_control();
},false);

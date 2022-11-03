
let debug = false;

/* https://anovsiradj.github.io/webapp.js */
const dump = (...list) => Array.from(list).forEach(item => console.debug(item));

const empty = (...list) => {
	return Array.from(list).every(item => {
		if (item === null) return true;
		if (typeof item == 'undefined') return true;
		if (typeof item == 'boolean' && item == false) return true;
		if (typeof item == 'string' && e.trim() == '') return true;
		return false;
	});
};

const defaults = {
	player_selector: '#ytd-player .html5-video-player',
	controls_selector: `#ytd-player .html5-video-player .ytp-chrome-controls`,
	video_selector: '#ytd-player .html5-video-player .html5-main-video',
};

var hash = `ytextra1_${Date.now().toString(12)}`;
var data = {
	scale: 1,
	rotate: 0,
	top: 0,
	left: 0,
};

dump('YTEXTRA1', hash, data);

var style_contents = [
	`${defaults.video_selector} { transform: scale(${data.scale}) rotate(${data.rotate}deg); top: ${data.top}px !important; left: ${data.left}px !important; }`,
	`${defaults.controls_selector} .ytp-right-controls .ytextra1.ytp-button {}`,
	`${defaults.controls_selector} .ytp-right-controls .ytextra1.ytp-button:last-of-type {
		margin-right: 12px;
	}`,
	`${defaults.controls_selector} .ytp-right-controls .ytextra1.ytp-button input {
		width: 36px;
		position: relative;
		color: #fff;
		background-color: transparent;
		border: 1px solid #fff;
	}`,
	`${defaults.controls_selector} .ytp-right-controls .ytextra1.ytp-button input:focus {
		outline: none;
		box-shadow: none;
	}`,

	`${defaults.controls_selector} .ytp-right-controls .ytp-multicam-button.ytp-button {
		display: none !important;
	}`,
	/* HIDE miniplayer */
	`${defaults.controls_selector} .ytp-right-controls .ytp-subtitles-button.ytp-button {
		display: none !important;
	}`,
	/* HIDE miniplayer */
	`${defaults.controls_selector} .ytp-right-controls .ytp-miniplayer-button.ytp-button {
		display: none !important;
	}`,
	/* HIDE picture-in-picture */
	`${defaults.controls_selector} .ytp-right-controls .ytp-pip-button.ytp-button {
		display: none !important;
	}`,
];

function throttle(callback, limit = 100) {
	/* https://stackoverflow.com/a/27078401 */
	var waiting = false; 
	return function () {
		if (!waiting) {
			waiting = true;
			callback.apply(this, arguments);
			setTimeout(() => (waiting = false), limit); 
		} 
	}
}

function ce(tagname, options = {}, callback) {
	/* document create element */
	let elem = document.createElement(tagname);

	for (let o in options) {
		if (o in elem) {
			elem[o] = options[o];
		} else {
			o.setAttribute(o, options[o]);
		}
	}

	if (callback) callback(elem);
	return elem;
}

function elem_left_controls() {
	return document.querySelector(`${defaults.controls_selector} .ytp-right-controls`);
}

function inject_left_controls(elem, id) {
	if (id && document.getElementById(id)) return;

	let leftElem = elem_left_controls();
	if (empty(leftElem)) return;

	leftElem.insertBefore(elem, leftElem.firstElementChild);
}

function create_scale_control() {
	let id = `${hash}_scale`;

	let elem = document.getElementById(id);
	if (elem) {
		elem.value = data.scale;
		return;
	}

	ce('input', {
		id: id,
		type: 'number',
		min: 0,
		max: 10,
		step: 0.01,
		value: data.scale,
		title: 'Zoom In & Zoom Out',
	}, elem => {
		ce('div', {}, elem => {
			elem.classList.add('ytp-button', 'ytextra1');
			inject_left_controls(elem, id);
		}).appendChild(elem);

		elem.addEventListener('keypress', event => event.stopPropagation());
		elem.addEventListener('keydown', event => event.stopPropagation());
		elem.addEventListener('keyup', event => event.stopPropagation());
		elem.addEventListener('input', throttle(function (event) {
			event.stopPropagation();

			let value = Number(this.value);
			if (Number.isNaN(value) || value < Number(this.min)) value = data.scale;

			data.scale = value;
			update_style();
		}));
	});
}

function create_rotate_control() {
	let id = `${hash}_rotate`;

	let elem = document.getElementById(id);
	if (elem) {
		elem.value = data.rotate;
		return;
	}

	ce('input', {
		id: id,
		type: 'number',
		min: -360,
		max: 360,
		step: 30,
		value: data.rotate,
		title: 'Rotate Clockwise & Opposite',
	}, elem => {
		ce('div', {}, elem => {
			elem.classList.add('ytp-button', 'ytextra1');
			inject_left_controls(elem, id);
		}).appendChild(elem);

		elem.addEventListener('keypress', event => event.stopPropagation());
		elem.addEventListener('keydown', event => event.stopPropagation());
		elem.addEventListener('keyup', event => event.stopPropagation());
		elem.addEventListener('input', throttle(function (event) {
			event.stopPropagation();

			let value = Number(this.value);
			if (Number.isNaN(value) || value < Number(this.min) || value > Number(this.max)) value = data.rotate;

			data.rotate = value;
			update_style();
		}));
	});
}

function create_move_control(position) {
	let id = `${hash}_move_${position}`;

	let elem = document.getElementById(id);
	if (elem) {
		elem.value = data[position];
		return;
	}

	ce('input', {
		id: id,
		type: 'number',
		step: 10,
		value: data[position],
		title: `Move To ${position.toUpperCase()} & Opposite`,
	}, elem => {
		ce('div', {}, elem => {
			elem.classList.add('ytp-button', 'ytextra1');
			inject_left_controls(elem, id);
		}).appendChild(elem);

		elem.addEventListener('keypress', event => event.stopPropagation());
		elem.addEventListener('keydown', event => event.stopPropagation());
		elem.addEventListener('keyup', event => event.stopPropagation());
		elem.addEventListener('input', throttle(function (event) {
			event.stopPropagation();

			let value = Number(this.value);
			if (Number.isNaN(value)) value = 0;

			data[position] = value;
			update_style();
		}));
	});
}

function create_style() {
	let style = document.head.querySelector(`#${hash}`);
	if (style) return style; // lewati kalau ada

	dump('[YTEXTRA1] styleCreated');
	return ce('style', { id: hash }, style => {
		document.head.appendChild(style);
		style_contents.forEach(rule => style.sheet.insertRule(rule));
	});
}

function update_style() {
	dump('[YTEXTRA1] styleUpdated');

	let style = document.head.querySelector(`#${hash}`);

	Array
		.from(style?.sheet?.cssRules || [])
		.forEach(rule => {
			if (rule.selectorText === defaults.video_selector) {
				rule.style.transform = `scale(${data.scale}) rotate(${data.rotate}deg)`;
				rule.style.setProperty('top', `${data.top}px`, 'important');
				rule.style.setProperty('left', `${data.left}px`, 'important');
			}
		});
}

function reset_controls() {
	for (let i in data) data[i] = 0;
	data.scale = 1;
	update_style();
}

function modify_player() {
	create_scale_control();
	create_move_control('top');
	create_move_control('left');
	create_rotate_control();
}

chrome.runtime.onMessage.addListener(message => {
	if ('is_debug' in message) {
		debug = message.is_debug;
	}
	if ('is_watch' in message && message.is_watch) {
		create_style();
		reset_controls();
		modify_player();
	}
});

document.addEventListener('readystatechange', event => {
	if (
		(event.target.readyState === 'interactive' || event.target.readyState === 'complete') &&
		window.location.pathname === '/watch'
	) {
		create_style();
		reset_controls();
		modify_player();
	}
}, {
	once: true,
	passive: true,
});

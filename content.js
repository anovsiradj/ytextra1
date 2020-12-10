

var data = {
	rotate: '0deg',
	scale: 1,
	top: 0,
	left: 0,
};
var uuid = 'ytextra1';
var hash = 'ytextra1_' + (new Date).toISOString().replace(/[^A-Za-z0-9]/g,'');

function dump() {
	Array.from(arguments).forEach(a => console.log(a));
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
	return document.querySelector('#ytd-player');
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

function create_control_elem(tagname = 'button', options = {}, callback) {
	let elem = ce(tagname, options, callback);
	elem.classList.add('ytp-button');
	return elem;
}

function inject_left_controls(elem) {
	dump(elem_left_controls());
	elem_left_controls()?.insertBefore(elem, elem_left_controls()?.querySelector('.ytp-subtitles-button'));
}

function create_scale_control() {
	let elem = ce('input', {
		type: 'number',
		min: 0,
		max: 5,
		step: 0.01,
		value: data.scale,
		title: 'Zoom Video',
	}, elem => {
		elem.style['width'] = '42px';
		elem.style['position'] = 'relative';
		elem.style['top'] = '-40%';
	});

	inject_left_controls(ce('div', {}, elem => {
		elem.classList.add('ytp-button');
	}).appendChild(elem));

	elem.addEventListener('keydown', event => event.stopPropagation());
	elem.addEventListener('keyup', event => event.stopPropagation());
	elem.addEventListener('keypress', event => event.stopPropagation());
	elem.addEventListener('input', function(event) {
		event.stopPropagation();
		data.scale = Number(this.value);
		update_style();
	});
}

function create_move_control(position) {
	let elem = ce('input', {
		type: 'number',
		step: 10,
		value: data[position],
		title: `Move Video ${position} Position`,
	}, elem => {
		elem.style['width'] = '42px';
		elem.style['position'] = 'relative';
		elem.style['top'] = '-40%';
	});

	inject_left_controls(ce('div', {}, elem => {
		elem.classList.add('ytp-button');
	}).appendChild(elem));

	elem.addEventListener('keydown', event => event.stopPropagation());
	elem.addEventListener('keyup', event => event.stopPropagation());
	elem.addEventListener('keypress', event => event.stopPropagation());
	elem.addEventListener('input', function(event) {
		event.stopPropagation();
		data[position] = Number(this.value);
		update_style();
	});
}

function create_style() {
	let elem = ce('style', {id: hash, })
	document.head.appendChild(elem);
	elem.sheet.insertRule(`#ytd-player .html5-main-video { transform: scale(${data.scale}) rotate(${data.rotate}); top: ${data.top}; left: ${data.left}; }`);
}


function update_style() {
	let elem = document.head.querySelector(`#${hash}`);

	Array
	.from(elem?.sheet?.cssRules || [])
	.forEach(rule => {
		dump(rule);
		if (! rule.selector === '#ytd-player .html5-main-video') return;
		rule.style.transform = `scale(${data.scale}) rotate(${data.rotate})`;

		rule.style.setProperty('top', `${data.top}px`, 'important');
		rule.style.setProperty('left', `${data.left}px`, 'important');
	});
}

window.addEventListener("load", () => {
	create_style();

	dump(hash, elem_player(), elem_controls(), elem_left_controls());

	create_move_control('top');
	create_move_control('left');
	create_scale_control();
},false);

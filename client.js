
let debug = false;

/* https://anovsiradj.github.io/webapp.js */
const dump = (...list) => Array.from(list).forEach(item => console.debug(item));

const defaults = {
	player_selector: '#ytd-player .html5-video-player',
	controls_selector: `#ytd-player .html5-video-player .ytp-chrome-controls`,
	video_selector: '#ytd-player .html5-video-player .html5-main-video',
};

var hash = `ytextra1_${Date.now().toString(12)}`;
var storage_key = 'ytextra1_data';
var data = {
	scale: 1,
	rotate: 0,
	top: 0,
	left: 0,
	keep: false,
};

function save_data() {
	localStorage.setItem(storage_key, JSON.stringify(data));
}

function load_data() {
	const saved = localStorage.getItem(storage_key);
	if (saved) {
		try {
			const parsed = JSON.parse(saved);
			data = { ...data, ...parsed };
		} catch (e) {
			dump('[YTEXTRA1] Failed to load data', e);
		}
	}
}

load_data();

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
	`${defaults.controls_selector} .ytp-right-controls .ytextra1.ytp-button.keep {
		width: auto;
	}`,
	`${defaults.controls_selector} .ytp-right-controls .ytextra1.ytp-button.keep input {
		width: 18px;
		height: 18px;
		vertical-align: middle;
	}`,
	`${defaults.controls_selector} .ytp-right-controls .ytextra1.ytp-button input:focus {
		outline: none;
		box-shadow: none;
	}`,
	/* hide autonav */
	`${defaults.controls_selector} .ytp-right-controls .ytp-autonav-toggle.ytp-button {
		display: none !important;
	}`,
	/* hide theater mode */
	`${defaults.controls_selector} .ytp-right-controls .ytp-size-button.ytp-button {
		display: none !important;
	}`,
	/* hide multicam */
	`${defaults.controls_selector} .ytp-right-controls .ytp-multicam-button.ytp-button {
		display: none !important;
	}`,
	/* hide subtitles */
	`${defaults.controls_selector} .ytp-right-controls .ytp-subtitles-button.ytp-button {
		display: none !important;
	}`,
	/* hide miniplayer */
	`${defaults.controls_selector} .ytp-right-controls .ytp-miniplayer-button.ytp-button {
		display: none !important;
	}`,
	/* hide picture-in-picture */
	`${defaults.controls_selector} .ytp-right-controls .ytp-pip-button.ytp-button {
		display: none !important;
	}`,
];

/* https://stackoverflow.com/a/27078401 */
function throttle(callback, limit = 100) {
	var waiting = false;
	return function () {
		if (!waiting) {
			waiting = true;
			callback.apply(this, arguments);
			setTimeout(() => (waiting = false), limit);
		}
	}
}

function inject_controls(name, input_options) {
	let id = `${hash}_${name}`

	if ($(`#${id}`).length) {
		if (input_options.type === 'checkbox') {
			$(`#${id}`).prop('checked', data[input_options.data_key]);
		} else {
			$(`#${id}`).val(data[input_options.data_key]);
		}
		return;
	}

	const $rightControls = $(`${defaults.controls_selector} .ytp-right-controls`);
	if (!$rightControls.length) return;

	const $container = $('<div/>', { class: `ytp-button ytextra1 ${name}` });
	const $input = $('<input/>', {
		id: id,
		type: input_options.type || 'number',
		autocomplete: 'off',
		...input_options
	});

	if (input_options.type === 'checkbox') {
		$input.prop('checked', data[input_options.data_key]);
	}

	$input.on('keypress keydown keyup', e => e.stopPropagation());
	$input.on('input change', throttle(function (e) {
		e.stopPropagation();
		let val;
		if (input_options.type === 'checkbox') {
			val = $(this).prop('checked');
		} else {
			val = Number($(this).val());
			if (Number.isNaN(val)) val = data[input_options.data_key];

			// Optional: clamp values if min/max provided
			if (input_options.min !== undefined && val < input_options.min) val = input_options.min;
			if (input_options.max !== undefined && val > input_options.max) val = input_options.max;
		}

		data[input_options.data_key] = val;
		save_data();
		update_style();
	}));

	$container.append($input);
	$rightControls.prepend($container);
}

function create_style() {
	if ($(`#${hash}`).length) return;

	dump('[YTEXTRA1] styleCreated');
	const $style = $('<style/>', { id: hash }).appendTo('head');
	const sheet = $style[0].sheet;
	style_contents.forEach(rule => sheet.insertRule(rule));
}

function update_style() {
	dump('[YTEXTRA1] styleUpdated');
	const style = document.getElementById(hash);
	if (!style) return;

	const rules = style.sheet.cssRules;
	for (let i = 0; i < rules.length; i++) {
		if (rules[i].selectorText === defaults.video_selector) {
			rules[i].style.transform = `scale(${data.scale}) rotate(${data.rotate}deg)`;
			rules[i].style.setProperty('top', `${data.top}px`, 'important');
			rules[i].style.setProperty('left', `${data.left}px`, 'important');
			break;
		}
	}
}

function reset_controls() {
	load_data();
	if (!data.keep) {
		data = { ...data, scale: 1, rotate: 0, top: 0, left: 0 };
	}
	update_style();
}

function waitForElement(selector, callback, attempts = 10) {
	const $el = $(selector);
	if ($el.length) {
		callback($el);
	} else if (attempts > 0) {
		setTimeout(() => waitForElement(selector, callback, attempts - 1), 1000);
	}
}

function modify_player() {
	const selector = `${defaults.controls_selector} .ytp-right-controls`;
	waitForElement(selector, () => {
		inject_controls('scale', { data_key: 'scale', min: 0, max: 10, step: 0.01, value: data.scale, title: 'Zoom In & Zoom Out' });
		inject_controls('move_top', { data_key: 'top', step: 10, value: data.top, title: 'Move To TOP & Opposite' });
		inject_controls('move_left', { data_key: 'left', step: 10, value: data.left, title: 'Move To LEFT & Opposite' });
		inject_controls('rotate', { data_key: 'rotate', min: -360, max: 360, step: 30, value: data.rotate, title: 'Rotate Clockwise & Opposite' });
		inject_controls('keep', { type: 'checkbox', data_key: 'keep', title: 'Keep Values' });
	});
}

chrome.runtime.onMessage.addListener(message => {
	if ('is_debug' in message) debug = message.is_debug;
	if ('is_watch' in message && message.is_watch) {
		create_style();
		reset_controls();
		modify_player();
	}
});

$(() => {
	if (window.location.pathname === '/watch') {
		create_style();
		reset_controls();
		modify_player();
	}
});

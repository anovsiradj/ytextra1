<?php

use Imagine\Image\Box;
use Imagine\Image\Point;
use Imagine\Image\Point\Center;

require __DIR__ . '/../vendor/autoload.php';

$sizes = [16, 32, 48, 96, 128];

$imagine = new Imagine\Gd\Imagine;

$logo = $imagine->open(__DIR__ . '/v2.png');
$logoCenter = new Center($logo->getSize());

$a = 1024;
$b = 190;
$c = ($a + $b) / 2;

$logoFit = $logo->crop(new Point($b, $b), new Box($c, $c));
$logoFit->save(__DIR__ . '/v2-fit.png');

foreach ($sizes as $size) {
	$icon = $logoFit->resize(new Box($size, $size));
	$icon->save(__DIR__ . "/{$size}.png", [
		'quality' => 100,
	]);
}

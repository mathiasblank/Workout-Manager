<?php

$files = scandir('webroot/sounds/playlist');
$playList = [];
foreach ($files as $key => $value) {
	if (in_array(pathinfo(strtolower($value), PATHINFO_EXTENSION), ['ogg', 'wav', 'mp3', 'mp4']) ) {
		$playList[] = $value;
	} 
}
echo json_encode($playList);


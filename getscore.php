<?php

$connection = mysqli_connect('localhost', 'root', '', 'raindrop_database');

if(!$connection) {
	echo 'failed to connect to db';
}

$result = mysqli_query($connection, "SELECT * FROM `scores` ORDER BY `score` DESC LIMIT 1");
$score = $result->fetch_assoc();

echo json_encode(intval($score['score']));

?>
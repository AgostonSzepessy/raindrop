<?php

$connection = mysqli_connect('localhost', 'root', '', 'raindrop_database');

$player_score = $_POST['score'];
$player_score = mysqli_real_escape_string($connection, $player_score);

$player_score = intval($player_score);

$result = mysqli_query($connection, "INSERT INTO `scores` (`score`) VALUES ('$player_score')");

?>
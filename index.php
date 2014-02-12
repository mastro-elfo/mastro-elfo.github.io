<?php

include_once('constants.php');
include_once(SYSTEM_PHP_DIR.'class.path.php');
include_once(SYSTEM_PHP_DIR.'class.pages.php');

if(file_exists($_REQUEST['path'])) {
	//echo file_get_contents($_REQUEST['path']);
	exit;
}

$path = new Path($_REQUEST['path']);
$pages = new Pages($path);
echo $pages->getHtml();

?>
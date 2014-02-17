<?php

if(array_key_exists('cmd', $_POST)) {
	switch($_POST['cmd']) {
		case 'get_module':
			header('Content-type: text/html');
			echo file_get_contents('../files/dollar/'.$_POST['module']);
			break;
	}
}
else {
	echo 'Error';
}

?>
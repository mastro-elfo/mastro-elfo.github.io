<?php

class Path {
	private $string;
	private $path;
	
	public function Path($path) {
		$this->string = $path;
		if(strpos($this->string, '.html') === false) {
			$this->string .= 'index.html';
		}
		preg_match_all('/\/?([^\/]+)/', $this->string, $this->path);
	}
	public function page() {
		return $this->path[0][count($this->path[0]) -1];
	}
};

?>
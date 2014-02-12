<?php

include_once('class.xml.php');

class Pagesxml extends Xml {
	protected $page;
	
	public function Pagesxml($id) {
		$this->id = $id;
		parent::Xml(CUSTOM_XML_DIR.'pages.xml');
		$this->page = parent::getNode('//page[@id=\''.$id.'\']');
	}
	
	public function getNodes($xpath, $content = null) {
		$content === null? $content = $this->page : 0;
		return parent::getNodes($xpath, $content);
	}
	
	function getNode($xpath, $content = null, $index = 0) {
		$content === null? $content = $this->page : 0;
		return parent::getNode($xpath, $content, $index);
	}
	
	function xpath($xpath, $content = null, $index = -1) {
		if($index == -1) {
			return parent::getNodes($xpath, $content, $index);
		}
		else{
			return parent::getNode($xpath, $content, $index);
		}
	}
};

?>
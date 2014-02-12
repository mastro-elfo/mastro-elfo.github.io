<?php

include_once('class.xml.php');

class Menusxml extends Xml {
	public function Menusxml() {
		parent::Xml(CUSTOM_XML_DIR.'menus.xml');
	}
	
	public function getMenuById($id) {
		return $this->getNode('//menu[@id=\''.$id.'\']');
	}
	
	public function getMenuByType($type, $lang) {
		return $this->getNode('//menu[@type=\''.$type.'\' and (@lang=\''.$lang.'\' or not(@lang))]');
	}
	
	public function getHtml($id) {
		$output = '';
		$menu = $this->getMenuById($id);
		if($menu) {
			$output .= '<ul>';
			$items = $this->getNodes('item', $menu);
			foreach($items as $item) {
				$output .= '<li><a href="'.$item->getAttribute('href').'" title="'.$item->getAttribute('title').'"><span>'.$item->getAttribute('value').'</span></a></li>';
			}
			$output .= '</ul>';
		}
		
		return $output;
	}
}

?>
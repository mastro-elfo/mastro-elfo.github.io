<?php

include_once('class.path.php');
include_once('class.pagesxml.php');
include_once('class.modelsxml.php');
include_once('class.menusxml.php');

class Pages {
	protected $pagesxml;
	protected $pagexml;
	
	public function Pages($path) {
		$this->path = $path;
		$this->pagesxml = new Pagesxml($path->page());
		$this->modelsxml = new Modelsxml();
		$this->menusxml = new Menusxml();
	}
	
	public function getHtml() {
		$output = '';
		$output .= $this->doctype();
		
		$manifest= $this->pagesxml->getNode('manifest');
		$manifest = $manifest? ' manifest="'.$appcache->getAttribute('value').'"' : '';
		$output .= '<html'.$manifest.'>'.$this->html().'</html>';
		return $output;
	}
	
	protected function doctype() {
		return '<!DOCTYPE html>';
	}
	
	protected function html() {
		$output = '';
		$output .= '<head>'.$this->head().'</head>';
		$output .= '<body>'.$this->body().'</body>';
		return $output;
	}
	
	protected function head() {
		$output = '';
		$output .= '<meta charset="UTF-8"/>';
		$output .= $this->meta();
		$output .= '<title>'.$this->title().'</title>';
		$output .= $this->style();
		return $output;
	}
	protected function body() {
		$output = '';
		$output .= '<div id="maincontainer">';
		$output .= '<div id="header">'.$this->content('header').'</div>';
		$output .= '<div id="navigator"><nav>'.$this->content('navigator').'</nav></div>';
		$output .= '<div id="contentcolumn">'.$this->content('contentcolumn').'</div>';
		$output .= '<div id="footer">'.$this->content('footer').'</div>';
		$output .= '</div>';
		return $output;
	}
	protected function content($id) {
		$output = '';
		switch($id) {
			case 'navigator':
				// Navigator code
				$navigator = $this->pagesxml->getNode('content/navigator');
				if($navigator) {
					$output .= $this->menusxml->getHtml($navigator->getAttribute('menu'));
				}
				break;
			default:
				$nodes = $this->pagesxml->getNodes('content/'.$id.'[@lang=\'it\' or not(@lang)]');
				foreach($nodes as $node) {
					$output .= $this->modelsxml->applyModel($node->getAttribute('model'), $node->getAttribute('value'));
				}
				break;
		}
		return $output;
	}
	
	protected function title() {
		$output = '';
		$title = $this->pagesxml->getNode('title[@lang=\'it\' or not(@lang)]');
		$output .= $title ? $this->modelsxml->applyModel($title->getAttribute('model'), $title->getAttribute('value')) : '';
		return $output;
	}
	
	protected function meta() {
		$metas = $this->pagesxml->getNodes('meta[@lang=\'it\' or not(@lang)]');
		$output = '';
		foreach($metas as $meta) {
			$output .= '<meta name="'.$meta->getAttribute('name').'" content="'.$this->modelsxml->applyModel($meta->getAttribute('model'), $meta->getAttribute('value')).'"/>';
		}
		return $output;
	}
	
	protected function style() {
		$styles = $this->pagesxml->getNodes('css');
		$output = '';
		foreach($styles as $style) {
			$output .= '<link rel="stylesheet" type="text/css" href="'.$style->getAttribute('value').'"/>';
		}
		return $output;
	}
};

?>
<?php

include_once('class.xml.php');

class Modelsxml extends Xml {
	public function Modelsxml() {
		parent::Xml(CUSTOM_XML_DIR.'models.xml');
	}
	
	public function getModel($id) {
		return $this->getNode('//model[@id=\''.$id.'\']');
	}
	
	public function applyModel($id, $text) {
		$model = $this->getModel($id);
		if(!$model) {
			return $text;
		}
		
		switch($model->getAttribute('position')) {
			case 'before':
				return $model->getAttribute('value').$text;
				break;
			case 'after':
				return $text.$model->getAttribute('value');
				break;
			default:
			case 'overwrite':
				return $model->getAttribute('value');
				break;
		}
	}
}

?>
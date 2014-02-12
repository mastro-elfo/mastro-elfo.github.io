<?php

/**
 * Class Xml
 * @version 0.0.1
 * @author Francesco Michienzi <francesco.209@gmail.com>
 */
class Xml {
	protected $_dom_xml;
	protected $_xml_file_name;
	protected $_dom_xpath;
	protected $_xsl_file_name;
	
	function Xml($xml_file, $xsl_file = '') {
		$this->_dom_xml = new DOMDocument('1.0', 'UTF-8');
		$this->_xsl_file_name = $xsl_file;
		
		if(!is_object($xml_file))
		{
			if(!$xml_file || preg_match('/^</', $xml_file))
				$this->_xml_file_name = '';
			else
				$this->_xml_file_name = $xml_file;
			
			if($this->_xml_file_name)
				$this->_dom_xml->load($this->_xml_file_name);
			else if($xml_file)
				$this->_dom_xml->loadXML($xml_file);
		}
		else {
			$this->_dom_xml->loadXML($xml_file->getXML());
		}
		
		$this->_dom_xpath = new DOMXPath($this->_dom_xml);
	}
	
	function appendNodes($nodes, $xpath = '', $attributes = array()) {
		$parent_node = $this->_dom_xml->documentElement;
		
		$index = 0;
		if($xpath) {
			$node_list = $this->_dom_xpath->evaluate($xpath);
			if($node_list && $node_list->length) 
			{
				$index = $node_list->length - 1;
				$parent_node = $node_list->item($index);
			}
		}
		
		while ($index >= 0) {
			if(is_array($nodes))
			{
				foreach($nodes as $node_name => $node_value)
				{
					$node = $this->_dom_xml->createElement($node_name, $node_value);
					foreach($attributes as $attribute => $value)
						$node->setAttribute($attribute, $value);
					$parent_node->appendChild($node);
				}
			}
			else
			{
				$node = $this->_dom_xml->createElement($nodes);
				foreach($attributes as $attribute => $value)
					$node->setAttribute($attribute, $value);
				$parent_node->appendChild($node);
			}
			
			$index--;
			
			if($index > 0)
				$parent_node = $node_list->item($index);
			else
				break;
			
		}
		
		return true;
	}
	
	function getNodes($xpath, $context = null) {
		if(!$context) {
			return $this->_dom_xpath->evaluate($xpath);
		}
		else {
			return $this->_dom_xpath->evaluate($xpath, $context);
		}
	}
	
	function getNode($xpath, $context = null, $index = 0) {
		$node_list = $this->getNodes($xpath, $context);
		if($node_list && $node_list->length > $index) {
			return $node_list->item($index);
		}
		else {
			return null;
		}
	}
	
	function removeNodes($xpath, $context = null) {
		$count = 0;
		$node_list = $this->getNodes($xpath, $context);
		foreach($node_list as $node) {
			$node->parentNode->removeChild($obj);
			$count++;
		}
		return $count;
	}
	
	function updateNodes($xpath, $context = null, $value = null, $attributes = array()) {
		$node_list = $this->getNodes($xpath, $context);
		foreach($node_list as $node) {
			if($value !== null) {
				$node->nodeValue = $value;
			}
			foreach($attributes as $name => $value) {
				$node->setAttribute($name, $value);
			}
		}
	}
	
	function setAttribute($name, $value) {
		return $this->_dom_xml->documentElement->setAttribute($name, $value);
	}
	
	function getAttribute($name) {
		return $this->_dom_xml->documentElement->getAttribute($name);
	}
	
	function getHtml($xsl = '', $php_functions = array()) {
		if(!$xsl && !$this->_xsl_file_name) {
			return $this->getXML();
		}
		else {
			$xsl = $xsl? $xsl : $this->_xsl_file_name;
		}
		
		if(class_exists('XSLTProcessor') && is_string($xsl) && is_file($xsl)) {
			$dom_xsl = new DOMDocument('1.0', 'UTF-8');
			$dom_xsl->load($xsl);
			
			$proc = new XSLTProcessor();
			foreach($php_functions as $php_function) {
				$proc->registerPHPFunctions($php_function);
			}
			$proc->importStyleSheet($dom_xsl); // attach the xsl rules
			
			$dom_html = $proc->transformToDoc($this->_dom_xml);
			return $dom_html->saveHTML();
		}
		else {
			return $this->_transform($xsl);
		}
	}
	
	function getXML($header = true, $node = null) {
		if ($node) {
			$output = $this->_dom_xml->saveXML($node);
		}
		else {
			$output = $this->_dom_xml->saveXML();
		}
		if(!$header) {
			$output = preg_replace('/\<\?xml.*?\?\>/s', '', $output);
		}
		return $output;
	}
	
	function save($file_name = '') {
		if(!$file_name)
		{
			if($this->_xml_file_name)
				$this->_dom_xml->save($this->_xml_file_name);
			else
				return $this->_dom_xml->saveXML();
		}
		else {
			$this->_dom_xml->save($file_name);
		}
	}
	
	/**
	 * @details Redefine this function to fit your needs.
	 */
	protected function _transform ($xsl) {
		return '';
	}
};

?>
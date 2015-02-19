<?php
/**
 * ownCloud
 *
 * @author Joas Schilling
 * @copyright 2015 Joas Schilling nickvergessen@owncloud.com
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later.
 * See the COPYING-README file.
 */

namespace OC\Files;


use OCP\IConfig;

class MapperDatabaseHelper {
	/** @var IConfig */
	protected $config;

	/**
	 * Constructor
	 *
	 * @param IConfig $config
	 */
	public function __construct(IConfig $config) {
		$this->config = $config;
	}

	/**
	 * Returns the path with escaped backslashes for a EQUALS statement
	 *
	 * @param string $path
	 * @return string
	 */
	public function escapePathEquals($path) {
		return $path;
	}

	/**
	 * Returns the path with escaped backslashes for a LIKE statement
	 *
	 * @param string $path
	 * @return string
	 */
	public function escapePathLike($path) {
		if ($this->requiresDoubleBackslash()) {
			return str_replace('\\', '\\\\', $path);
		}
		return $path;
	}

	protected function requiresDoubleBackslash() {
		return in_array($this->config->getSystemValue('dbtype'), array('mysql', 'pgsql'));
	}
}

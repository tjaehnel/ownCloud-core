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

	/** @var int */
	protected $equalsEscapes;

	/** @var int */
	protected $likeEscapes;

	/**
	 * Constructor
	 *
	 * @param IConfig $config
	 */
	public function __construct(IConfig $config) {
		$this->config = $config;

		if ($this->config->getAppValue('files', 'mapper.escape.equals') === '') {
			// Values are not in the config, time to test them
			$this->getNumberOfBackslashEscapes();
		} else {
			$this->equalsEscapes = $this->config->getAppValue('files', 'mapper.escape.equals');
			$this->likeEscapes = $this->config->getAppValue('files', 'mapper.escape.like');
		}
	}

	/**
	 * Returns the path with escaped backslashes for a EQUALS statement
	 *
	 * @param string $path
	 * @return string
	 */
	public function escapePathEquals($path) {
		return $this->escapeBackslashes($path, $this->equalsEscapes);
	}

	/**
	 * Returns the path with escaped backslashes for a LIKE statement
	 *
	 * @param string $path
	 * @return string
	 */
	public function escapePathLike($path) {
		return $this->escapeBackslashes($path, $this->likeEscapes);
	}

	/**
	 * A method that backslash-escapes backslashes {$loop} times
	 *
	 * @param string $path Path to escape
	 * @param int $loop Number of time the path should be escaped
	 * @return string Escaped path
	 */
	protected function escapeBackslashes($path, $loop) {
		if ($loop <= 0) {
			return $path;
		}
		return $this->escapeBackslashes(str_replace('\\', '\\\\', $path), $loop - 1);
	}

	/**
	 * Test how many times backslashes need to be escaped in = and LIKE queries
	 */
	protected function getNumberOfBackslashEscapes() {
		$testPath = 'NickvSays\\NoPathHasThisName';
		$this->createTestEntry($testPath);

		// Testing
		$this->equalsEscapes = $this->testEscapes($testPath, '=', 'equals');
		$this->likeEscapes = $this->testEscapes($testPath, 'LIKE', 'like');

		$this->deleteTestEntry($testPath);
	}

	/**
	 * Test multiple escapes and save the number in the config
	 *
	 * @param string $path
	 * @param string $operator
	 * @param string $configName
	 * @return int Number of escapes required
	 * @throws \OC\DatabaseException
	 */
	protected function testEscapes($path, $operator, $configName) {
		for ($i = 0; $i <= 3; $i++) {
			if ($this->testEscapedPath($this->escapeBackslashes($path, $i), $operator)) {
				$this->config->setAppValue('files', 'mapper.escape.' . $configName, $i);
				return $i;
			}
		}
		throw new \OC\DatabaseException('Could not determinate the number of required backslash escapes');
	}

	/**
	 * Test a given escaped path on this database
	 *
	 * @param string $path
	 * @param string $operator
	 * @return bool|array False if the path could not be found, array otherwise
	 * @throws \OC\DatabaseException
	 */
	protected function testEscapedPath($path, $operator) {
		$sql = 'SELECT *'
			. ' FROM `*PREFIX*file_map`'
			. ' WHERE `logic_path` ' . $operator . ' ?';
		$result = \OC_DB::executeAudited($sql, [$path]);
		return $result->fetchRow();
	}

	/**
	 * Creates a test path in the file map
	 *
	 * @param string $path
	 * @throws \OC\DatabaseException
	 */
	protected function createTestEntry($path) {
		$sql = 'INSERT INTO `*PREFIX*file_map` (`logic_path`, `physic_path`, `logic_path_hash`, `physic_path_hash`)'
			. ' VALUES (?, ?, ?, ?)';
		\OC_DB::executeAudited($sql, array($path, $path, md5($path), md5($path)));
	}

	/**
	 * Deletes the test path from the file map again
	 *
	 * @param string $path
	 * @throws \OC\DatabaseException
	 */
	protected function deleteTestEntry($path) {
		$sql = 'DELETE FROM `*PREFIX*file_map`'
			. ' WHERE `logic_path_hash` = ?';
		\OC_DB::executeAudited($sql, [md5($path)]);
	}
}

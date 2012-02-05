<?php

/**
* ownCloud - user_ldap
*
* @author Dominik Schmidt
* @copyright 2011 Dominik Schmidt dev@dominik-schmidt.de
* @author Tom Needham
* @copyright 2012 Tom Needham tom@owncloud.com
*
* This library is free software; you can redistribute it and/or
* modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
* License as published by the Free Software Foundation; either
* version 3 of the License, or any later version.
*
* This library is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU AFFERO GENERAL PUBLIC LICENSE for more details.
*
* You should have received a copy of the GNU Affero General Public
* License along with this library.  If not, see <http://www.gnu.org/licenses/>.
*
*/


OC_APP::registerAdmin('admin_export','settings');

// add settings page to navigation
$entry = array(
	'id' => "admin_export_settings",
	'order'=>1,
	'href' => OC_Helper::linkTo( "admin_export", "settings.php" ),
	'name' => 'Export'
);

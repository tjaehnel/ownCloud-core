
/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OCA = OCA || {};

(function() {

	/**
	 * @classdesc a Port Detector. It executes the auto-detection of the port
	 * by the ownCloud server, if requirements are met.
	 *
	 * @constructor
	 */
	var WizardDetectorUserCount = OCA.LDAP.Wizard.WizardDetectorFilterSimpleRequestAbstract.subClass({
		init: function() {
			this.setTargetKey('ldap_user_count');
			this.wizardMethod = 'countUsers';
			this.runsOnRequest = true;
		}
	});

	OCA.LDAP.Wizard.WizardDetectorUserCount = WizardDetectorUserCount;
})();

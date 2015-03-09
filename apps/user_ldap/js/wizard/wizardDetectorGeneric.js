
/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OCA = OCA || {};

(function() {
	var WizardDetectorGeneric = OCA.LDAP.Wizard.WizardObject.subClass({
		init: function() {
			this.setTrigger([]);
		},

		setTrigger: function(triggers) {
			this.triggers = triggers;
		},

		triggersOn: function(key) {
			return ($.inArray(key, this.triggers) >= 0);
		},

		run: function(model, configID) {
			// to be implemented by subClass
			return false;
		}
	});

	OCA.LDAP.Wizard.WizardDetectorGeneric = WizardDetectorGeneric;
})();
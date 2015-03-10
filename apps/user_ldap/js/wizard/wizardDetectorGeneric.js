
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
			this.targetKey = '';
		},

		setTrigger: function(triggers) {
			this.triggers = triggers;
		},

		triggersOn: function(key) {
			return ($.inArray(key, this.triggers) >= 0);
		},

		setTargetKey: function(key) {
			this.targetKey = key;
		},

		getTargetKey: function() {
			return this.targetKey;
		},

		run: function(model, configID) {
			// to be implemented by subClass
			return false;
		},

		processResult: function(model, detector, result) {
			// TODO: catch if user switched configuration while we're running
			model.notifyAboutDetectionCompletion(detector.getTargetKey());
			if(result.status === 'success') {
				for (var id in result.changes) {
					// update and not set method, as values are already stored
					model.update(id, result.changes[id]);
				}
			} else {
				// TODO show notification
			}
		}
	});

	OCA.LDAP.Wizard.WizardDetectorGeneric = WizardDetectorGeneric;
})();
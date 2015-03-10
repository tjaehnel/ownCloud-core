
/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OCA = OCA || {};

(function() {

	var WizardDetectorPort = OCA.LDAP.Wizard.WizardDetectorGeneric.subClass({
		init: function() {
			this.setTrigger([
				'ldap_host',
				'ldap_port',
				'ldap_dn',
				'ldap_agent_password'
			]);
		},

		run: function(model, configID) {
			model.notifyAboutDetectionStart('ldap_port');
			var params = OC.buildQueryString({
				action: 'guessPortAndTLS',
				ldap_serverconfig_chooser: configID
			});
			return model.callWizard(params, this.processResult, this);
		},

		processResult: function(model, detector, result) {
			// TODO: catch if user switched configuration while we're running
			model.notifyAboutDetectionCompletion('ldap_port');
			if(result.status === 'success') {
				for (var id in result.changes) {
					// update and not set method, as values are already stored
					model.update(id, result.changes[id]);
				}
			}
			console.log(result);
			console.log(model.configuration);
		}
	});

	OCA.LDAP.Wizard.WizardDetectorPort = WizardDetectorPort;
})();

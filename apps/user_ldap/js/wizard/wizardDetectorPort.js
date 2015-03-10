
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
			this.setTargetKey('ldap_port');
		},

		overrideErrorMessage: function(message) {
			if(message === 'Invalid credentials') {
				return t('user_ldap', 'Please check the credentials, they seem to be wrong.');
			}
			return t('user_ldap', 'Please specify the port, it could not be auto-detected.');
		},

		run: function(model, configID) {
			if(model.configuration['ldap_port']) {
				// don't attempt to overwrite a configured port
				return false;
			}

			model.notifyAboutDetectionStart('ldap_port');
			var params = OC.buildQueryString({
				action: 'guessPortAndTLS',
				ldap_serverconfig_chooser: configID
			});
			return model.callWizard(params, this.processResult, this);
		}
	});

	OCA.LDAP.Wizard.WizardDetectorPort = WizardDetectorPort;
})();

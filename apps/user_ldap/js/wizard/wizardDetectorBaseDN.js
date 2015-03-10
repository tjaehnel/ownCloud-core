
/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OCA = OCA || {};

(function() {

	var WizardDetectorBaseDN = OCA.LDAP.Wizard.WizardDetectorGeneric.subClass({
		init: function() {
			this.setTrigger([
				'ldap_host',
				'ldap_port',
				'ldap_dn',
				'ldap_agent_password'
			]);
			this.setTargetKey('ldap_dn');
		},

		overrideErrorMessage: function(message) {
			if(   message === 'Server is unwilling to perform'
			   || message === 'Could not connect to LDAP'
			) {
				return t('user_ldap', 'Base DN could not be auto-detected, please revise credentials, host and port.');
			}
			return t('user_ldap', 'Please specify a Base DN, it could not be auto-detected.');
		},

		run: function(model, configID) {
			if(    !model.configuration['ldap_host']
				|| !model.configuration['ldap_port']
				|| !model.configuration['ldap_dn']
				|| !model.configuration['ldap_agent_password']
				)
			{
				return false;
			}
			model.notifyAboutDetectionStart('ldap_dn');
			var params = OC.buildQueryString({
				action: 'guessBaseDN',
				ldap_serverconfig_chooser: configID
			});
			return model.callWizard(params, this.processResult, this);
		}
	});

	OCA.LDAP.Wizard.WizardDetectorBaseDN = WizardDetectorBaseDN;
})();

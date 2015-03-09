
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

			var params = OC.buildQueryString({
				action: 'guessBaseDN',
				ldap_serverconfig_chooser: configID
			});
			return model.callWizard(params, this.processResult, this);
		},

		processResult: function(model, detector, result) {
			// TODO: catch if user switched configuration while we're running
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

	OCA.LDAP.Wizard.WizardDetectorBaseDN = WizardDetectorBaseDN;
})();


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
	var WizardDetectorUserObjectClasses = OCA.LDAP.Wizard.WizardDetectorGeneric.subClass({
		/** @inheritdoc */
		init: function() {
			// given, it is not a configuration key
			this.setTargetKey('ldap_userfilter_objectclass');
			this.runsOnRequest = true;
		},

		/** @inheritdoc */
		overrideErrorMessage: function(message) {
			if(message === 'Invalid credentials') {
				return t('user_ldap', 'Please check the credentials, they seem to be wrong.');
			}
			return t('user_ldap', 'Please specify the port, it could not be auto-detected.');
		},

		/**
		 * runs the detector, if port is not set.
		 *
		 * @param {OCA.LDAP.Wizard.ConfigModel} model
		 * @param {string} configID - the configuration prefix
		 * @returns {boolean|jqXHR}
		 * @abstract
		 */
		run: function(model, configID) {
			model.notifyAboutDetectionStart('ldap_userfilter_objectclass');
			var params = OC.buildQueryString({
				action: 'determineUserObjectClasses',
				ldap_serverconfig_chooser: configID
			});
			return model.callWizard(params, this.processResult, this);
		},

		/**
		 * @inheritdoc
		 */
		processResult: function(model, detector, result) {
			if(result.status === 'success') {
				var payload = {
					feature: 'UserObjectClasses',
					data: result.options['ldap_userfilter_objectclass']
				};
				model.inform(payload);
			}
			this._super(model, detector, result);
		}
	});

	OCA.LDAP.Wizard.WizardDetectorUserObjectClasses = WizardDetectorUserObjectClasses;
})();

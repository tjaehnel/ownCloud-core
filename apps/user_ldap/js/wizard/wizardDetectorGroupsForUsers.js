
/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OCA = OCA || {};

(function() {

	/**
	 * @classdesc detects groups for the users tab
	 *
	 * @constructor
	 */
	var WizardDetectorGroupsForUsers = OCA.LDAP.Wizard.WizardDetectorGeneric.subClass({
		wizardMethod: 'determineGroupsForUsers',
		configKey: 'ldap_userfilter_groups',
		featureName: 'GroupsForUsers',

		/** @inheritdoc */
		init: function() {
			// given, it is not a configuration key
			this.setTargetKey(this.configKey);
			this.runsOnRequest = true;
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
			model.notifyAboutDetectionStart(this.configKey);
			var params = OC.buildQueryString({
				action: this.wizardMethod,
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
					feature: detector.featureName,
					data: result.options[detector.configKey]
				};
				model.inform(payload);
			}

			this._super(model, detector, result);
		}
	});

	OCA.LDAP.Wizard.WizardDetectorGroupsForUsers = WizardDetectorGroupsForUsers;
})();

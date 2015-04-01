
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
	var WizardDetectorTestAbstract = OCA.LDAP.Wizard.WizardDetectorGeneric.subClass({
		/**
		 * runs the test
		 *
		 * @param {OCA.LDAP.Wizard.ConfigModel} model
		 * @param {string} configID - the configuration prefix
		 * @param {Object} params - additional parameters needed to send to the
		 * wizard
		 * @returns {boolean|jqXHR}
		 * @abstract
		 */
		run: function(model, configID, params) {
			if(_.isUndefined(this.wizardMethod)) {
				console.warn('wizardMethod not set! ' + this.constructor);
				return false;
			}
			model.notifyAboutDetectionStart(this.getTargetKey());
			var params = OC.buildQueryString($.extend({
				action: this.wizardMethod,
				ldap_serverconfig_chooser: configID
			}, params));
			return model.callWizard(params, this.processResult, this);
		},

		/**
		 * @inheritdoc
		 */
		processResult: function(model, detector, result) {
			model['notifyAboutDetectionCompletion'](detector.getTargetKey());
			var payload = {
				feature: detector.testName,
				data: result
			};
			model.inform(payload);
		}
	});

	OCA.LDAP.Wizard.WizardDetectorTestAbstract = WizardDetectorTestAbstract;
})();

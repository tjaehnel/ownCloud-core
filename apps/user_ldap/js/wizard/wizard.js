/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

/**
 * initializes the wizard and related components and kicks it off.
 */
$(document).ready(function() {
	var detectorQueue = new OCA.LDAP.Wizard.WizardDetectorQueue();
	detectorQueue.init();

	var detectors = [];
	detectors.push(new OCA.LDAP.Wizard.WizardDetectorPort());
	detectors.push(new OCA.LDAP.Wizard.WizardDetectorBaseDN());
	detectors.push(new OCA.LDAP.Wizard.WizardDetectorUserObjectClasses());
	detectors.push(new OCA.LDAP.Wizard.WizardDetectorGroupsForUsers());
	detectors.push(new OCA.LDAP.Wizard.WizardDetectorFilterUser());
	detectors.push(new OCA.LDAP.Wizard.WizardDetectorUserCount());
	detectors.push(new OCA.LDAP.Wizard.WizardDetectorAvailableAttributes());

	var model = new OCA.LDAP.Wizard.ConfigModel();
	model.init();
	model.setDetectorQueue(detectorQueue);
	// NOTE: order of detectors may play a role
	// for example, BaseDN detector needs the port. The port is typically found
	// by the Port Detector. If BaseDN detector was run first, it will not have
	// all necessary information. Only after Port Detector was executed…
	for(var i = 0; i <= detectors.length; i++) {
		model.registerDetector(detectors[i]);
	}

	var tabs = [];
	tabs.push(new OCA.LDAP.Wizard.WizardTabUserFilter());
	tabs.push(new OCA.LDAP.Wizard.WizardTabLoginFilter());

	var view = new OCA.LDAP.Wizard.WizardView(model);
	view.init();
	view.setModel(model);
	for(var i = 0; i <= tabs.length; i++) {
		view.registerTab(tabs[i], '#ldapWizard' + (i+2));
	}

	var controller = new OCA.LDAP.Wizard.Controller();
	controller.init();
	controller.setView(view);
	controller.setModel(model);
	controller.run();
});

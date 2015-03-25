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

	var portDetector = new OCA.LDAP.Wizard.WizardDetectorPort();

	var baseDNDetector = new OCA.LDAP.Wizard.WizardDetectorBaseDN();

	var userObjectClassDetector = new OCA.LDAP.Wizard.WizardDetectorUserObjectClasses();

	var model = new OCA.LDAP.Wizard.ConfigModel();
	model.init();
	model.setDetectorQueue(detectorQueue);
	// NOTE: order of detectors may play a role
	// for example, BaseDN detector needs the port. The port is typically found
	// by the Port Detector. If BaseDN detector was run first, it will not have
	// all necessary information. Only after Port Detector was executed…
	model.registerDetector(portDetector);
	model.registerDetector(baseDNDetector);
	model.registerDetector(userObjectClassDetector);

	var userFilterTab = new OCA.LDAP.Wizard.WizardTabUserFilter();

	var view = new OCA.LDAP.Wizard.WizardView(model);
	view.init();
	view.setModel(model);
	view.registerTab(userFilterTab, '#ldapWizard2');

	var controller = new OCA.LDAP.Wizard.Controller();
	controller.init();
	controller.setView(view);
	controller.setModel(model);
	controller.run();
});

/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

$(document).ready(function() {
	var model = new OCA.LDAP.Wizard.ConfigModel();
	model.init();

	var view = new OCA.LDAP.Wizard.WizardView(model);
	view.init();
	view.setModel(model);

	var controller = new OCA.LDAP.Wizard.Controller();
	controller.init();
	controller.setView(view);
	controller.setModel(model);
	controller.run();
});

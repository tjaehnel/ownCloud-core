/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OCA = OCA || {};
OCA.LDAP = {};
OCA.LDAP.Wizard = {};

(function(){

	var WizardController = function() {};

	WizardController.prototype = {
		init: function() {
			this.view = false;
			this.configModel = false;
		},

		setModel: function(model) {
			this.configModel = model;
		},

		setView: function(view) {
			this.view = view;
		},

		run: function() {
			this.view.render();
		}
	};

	OCA.LDAP.Wizard.Controller = WizardController;
})();

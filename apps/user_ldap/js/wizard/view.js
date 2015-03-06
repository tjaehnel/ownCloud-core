/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OCA = OCA || {};

(function() {

	var WizardView = function() {};

	WizardView.prototype = {

		init: function () {
			this.tabs = {};
			this.tabs.server = new OCA.LDAP.Wizard.WizardTabElementary(0, 'weeehaaa');
			this.$settings = $('#ldapSettings');
			this.$saveSpinners = $('#ldap .ldap_saving');
			this.saveProcesses = 0;
		},

		initControls: function() {
			var view = this;
			$('.ldap_action_continue').click(function(event) {
				event.preventDefault();
				view._controlContinue(view);
			});

			$('.ldap_action_back').click(function(event) {
				event.preventDefault();
				view._controlBack(view);
			});
		},

		basicStatusCheck: function(view) {
			var host  = view.tabs.server.getHost();
			var port  = view.tabs.server.getPort();
			var base  = view.tabs.server.getBase();
			var agent = view.tabs.server.getAgentDN();
			var pwd   = view.tabs.server.getAgentPwd();

			if((host && port  && base) && ((!agent && !pwd) || (agent && pwd))) {
				view.enableTabs();
			} else {
				view.disableTabs();
			}
		},

		onSetRequested: function(view) {
			view.saveProcesses += 1;
			if(view.saveProcesses === 1) {
				view.showSaveSpinner();
			}
		},

		onSetRequestDone: function(view) {
			if(view.saveProcesses > 0) {
				view.saveProcesses -= 1;
				if(view.saveProcesses === 0) {
					view.hideSaveSpinner();
				}
			}

			view.basicStatusCheck(view);
		},

		setModel: function(configModel) {
			this.configModel = configModel;
			for(var i in this.tabs) {
				this.tabs[i].setModel(configModel);
			}

			// TODO make sure this is definitely run after tabs did their work, order is important here
			// for now this works, because tabs are supposed to register their listeners in their
			// setModel() method.
			// alternative: make Elementary Tab a Publisher as well.
			this.configModel.on('configLoaded', this.basicStatusCheck, this);
			this.configModel.on('configUpdated', this.basicStatusCheck, this);
			this.configModel.on('setRequested', this.onSetRequested, this);
			this.configModel.on('setCompleted', this.onSetRequestDone, this);
		},

		enableTabs: function() {
			//do not use this function directly, use basicStatusCheck instead.
			// TODO check for running save processes
			$('.ldap_action_continue').removeAttr('disabled');
			$('.ldap_action_back').removeAttr('disabled');
			this.$settings.tabs('option', 'disabled', []);
		},

		disableTabs: function() {
			$('.ldap_action_continue').attr('disabled', 'disabled');
			$('.ldap_action_back').attr('disabled', 'disabled');
			this.$settings.tabs('option', 'disabled', [1, 2, 3, 4, 5]);
		},

		showSaveSpinner: function() {
			this.$saveSpinners.removeClass('hidden');
			$('#ldap *').addClass('save-cursor');
		},

		hideSaveSpinner: function() {
			this.$saveSpinners.addClass('hidden');
			$('#ldap *').removeClass('save-cursor');
		},

		_requestConfig: function(configID) {
			this.configModel.load(configID);
		},

		render: function () {
			$('#ldapAdvancedAccordion').accordion({ heightStyle: 'content', animate: 'easeInOutCirc'});
			this.$settings.tabs({});
			$('.ldap_submit').button();
			$('.ldap_action_test_connection').button();
			$('#ldap_action_delete_configuration').button();

			this.initControls();
			this.disableTabs();

			this._requestConfig(this.tabs.server.getConfigID());
		},

		_controlBack: function(view) {
			var curTabIndex = view.$settings.tabs('option', 'active');
			if(curTabIndex == 0) {
				return;
			}
			view.$settings.tabs('option', 'active', curTabIndex - 1);
			view._controlUpdate(curTabIndex - 1);
		},

		_controlContinue: function(view) {
			var curTabIndex = view.$settings.tabs('option', 'active');
			if(curTabIndex == 3) {
				return;
			}
			view.$settings.tabs('option', 'active', 1 + curTabIndex);
			view._controlUpdate(curTabIndex + 1);
		},

		_controlUpdate: function(nextTabIndex) {
			if(nextTabIndex == 0) {
				$('.ldap_action_back').addClass('invisible');
				$('.ldap_action_continue').removeClass('invisible');
			} else
			if(nextTabIndex == 1) {
				$('.ldap_action_back').removeClass('invisible');
				$('.ldap_action_continue').removeClass('invisible');
			} else
			if(nextTabIndex == 2) {
				$('.ldap_action_continue').removeClass('invisible');
				$('.ldap_action_back').removeClass('invisible');
			} else
			if(nextTabIndex == 3) {
				$('.ldap_action_back').removeClass('invisible');
				$('.ldap_action_continue').addClass('invisible');
			}
		}
	};

	OCA.LDAP.Wizard.WizardView = WizardView;
})();

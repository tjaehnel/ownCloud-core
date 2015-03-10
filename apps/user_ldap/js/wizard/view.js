/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OCA = OCA || {};

(function() {

	var WizardView = function() {};

	WizardView.prototype = {
		STATUS_ERROR: 0,
		STATUS_INCOMPLETE: 1,
		STATUS_SUCCESS: 2,

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

		functionalityCheck: function() {
			// this method should be called only if necessary, because it may
			// cause an LDAP request!
			var host  = this.tabs.server.getHost();
			var port  = this.tabs.server.getPort();
			var base  = this.tabs.server.getBase();
			// TODO implement following when specific views are implemented
			var userFilter = false;
			var loginFilter = false;

			if(host && port && base && userFilter && loginFilter) {
				this.configModel.requestConfigurationTest();
			} else {
				this._updateStatusIndicator(this.STATUS_INCOMPLETE);
			}
		},

		considerFunctionalityCheck: function(changeSet) {
			var testTriggers = [
				'ldap_host', 'ldap_port', 'ldap_dn', 'ldap_agent_password',
				'ldap_base', 'ldap_userlist_filter', 'ldap_login_filter'
			];
			for(var key in changeSet) {
				if($.inArray(key, testTriggers)) {
					this.functionalityCheck();
					return;
				}
			}
		},

		onSetRequested: function(view) {
			view.saveProcesses += 1;
			if(view.saveProcesses === 1) {
				view.showSaveSpinner();
			}
		},

		onSetRequestDone: function(view, result) {
			if(view.saveProcesses > 0) {
				view.saveProcesses -= 1;
				if(view.saveProcesses === 0) {
					view.hideSaveSpinner();
				}
			}

			view.basicStatusCheck(view);
			var param = {};
			param[result.key] = 1;
			view.considerFunctionalityCheck(param);
		},

		onTestCompleted: function(view, result) {
			if(result.isSuccess) {
				view._updateStatusIndicator(view.STATUS_SUCCESS);
			} else {
				view._updateStatusIndicator(view.STATUS_ERROR);
			}
		},

		onConfigLoaded: function(view) {
			view.basicStatusCheck(view);
			view.functionalityCheck();
		},

		onConfigUpdated: function(view, changeSet) {
			view.basicStatusCheck(view);
			view.considerFunctionalityCheck(changeSet);
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
			this.configModel.on('configLoaded', this.onConfigLoaded, this);
			this.configModel.on('configUpdated', this.onConfigUpdated, this);
			this.configModel.on('setRequested', this.onSetRequested, this);
			this.configModel.on('setCompleted', this.onSetRequestDone, this);
			this.configModel.on('configurationTested', this.onTestCompleted, this);
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

		_updateStatusIndicator: function(state) {
			var $indicator = $('.ldap_config_state_indicator');
			var $indicatorLight = $('.ldap_config_state_indicator_sign');

			switch(state) {
				case this.STATUS_ERROR:
					$indicator.text(t('user_ldap',
						'Configuration incorrect'
					));
					$indicator.removeClass('ldap_grey');
					$indicatorLight.addClass('error');
					$indicatorLight.removeClass('success');
					break;
				case this.STATUS_INCOMPLETE:
					$indicator.text(t('user_ldap',
						'Configuration incomplete'
					));
					$indicator.removeClass('ldap_grey');
					$indicatorLight.removeClass('error');
					$indicatorLight.removeClass('success');
					break;
				case this.STATUS_SUCCESS:
					$indicator.text(t('user_ldap', 'Configuration OK'));
					$indicator.addClass('ldap_grey');
					$indicatorLight.removeClass('error');
					$indicatorLight.addClass('success');
					break;
			}
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

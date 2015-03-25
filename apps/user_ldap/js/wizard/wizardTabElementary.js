
/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OCA = OCA || {};

(function() {

	/**
	 * @classdesc This class represents the view belonging to the server tab
	 * in the LDAP wizard.
	 */
	var WizardTabElementary = OCA.LDAP.Wizard.WizardTabGeneric.subClass({
		/**
		 * initializes the instance. Always call it after initialization.
		 *
		 * @param tabIndex
		 * @param tabID
		 */
		init: function (tabIndex, tabID) {
			this._super(tabIndex, tabID);
			this.configChooserID = '#ldap_serverconfig_chooser';

			var items = {
				'ldap_host': {
					$element: $('#ldap_host'),
					setMethod: 'setHost'
				},
				'ldap_port': {
					$element: $('#ldap_port'),
					setMethod: 'setPort'
				},
				'ldap_dn': {
					$element: $('#ldap_dn'),
					setMethod: 'setAgentDN'
				},
				'ldap_agent_password': {
					$element: $('#ldap_agent_password'),
					setMethod: 'setAgentPwd'
				},
				'ldap_base': {
					$element: $('#ldap_base'),
					setMethod: 'setBase'
				},
				'ldap_experienced_admin': {
					$element: $('#ldap_experienced_admin'),
					setMethod: 'setExperiencedAdmin'
				}
			};
			this.setManagedItems(items);
		},

		/**
		 * Sets the config model for this view and subscribes to some events.
		 * Also binds the config chooser to the model
		 *
		 * @param {OCA.LDAP.Wizard.ConfigModel} configModel
		 */
		setModel: function(configModel) {
			this._super(configModel);
			this.configModel.on('configLoaded', this.onConfigLoaded, this);
			this.configModel.on('configUpdated', this.onConfigLoaded, this);
			this.configModel.on('setCompleted', this.onItemSaved, this);
			this.configModel.on('newConfiguration', this.onNewConfiguration, this);
			this.configModel.on('deleteConfiguration', this.onDeleteConfiguration, this);
			this._enableConfigChooser();
			this._enableConfigButtons();
		},

		/**
		 * returns the currently selected configuration ID
		 *
		 * @returns {string}
		 */
		getConfigID: function() {
			return $(this.configChooserID).val();
		},

		/**
		 * updates the host configuration text field
		 *
		 * @param {string} host
		 */
		setHost: function(host) {
			this.setElementValue(this.managedItems.ldap_host.$element, host);
		},

		/**
		 * returns the host value
		 *
		 * @returns {string}
		 */
		getHost: function() {
			return this.managedItems.ldap_host.$element.val();
		},

		/**
		 * updates the port configuration text field
		 *
		 * @param {string} port
		 */
		setPort: function(port) {
			this.setElementValue(this.managedItems.ldap_port.$element, port);
		},

		/**
		 * returns the port value
		 *
		 * @returns {string}
		 */
		getPort: function() {
			return this.managedItems.ldap_port.$element.val();
		},

		/**
		 * updates the user (agent) DN text field
		 *
		 * @param {string} agentDN
		 */
		setAgentDN: function(agentDN) {
			this.setElementValue(this.managedItems.ldap_dn.$element, agentDN);
		},

		/**
		 * returns the agent DN
		 *
		 * @returns {string}
		 */
		getAgentDN: function() {
			return this.managedItems.ldap_dn.$element.val();
		},

		/**
		 * updates the user (agent) password field
		 *
		 * @param {string} agentPwd
		 */
		setAgentPwd: function(agentPwd) {
			this.setElementValue(
				this.managedItems.ldap_agent_password.$element, agentPwd
			);
		},

		/**
		 * returns the agent password
		 *
		 * @returns {*|jQuery}
		 */
		getAgentPwd: function() {
			return this.managedItems.ldap_agent_password.$element.val();
		},

		/**
		 * updates the base DN text area
		 *
		 * @param {string} bases
		 */
		setBase: function(bases) {
			this.setElementValue(this.managedItems.ldap_base.$element, bases);
		},

		/**
		 * returns the base DN
		 * @returns {*|jQuery}
		 */
		getBase: function() {
			return this.managedItems.ldap_base.$element.val();
		},


		/**
		 * updates the experienced admin check box
		 *
		 * @param {string} xpAdminMode contains an int
		 */
		setExperiencedAdmin: function(xpAdminMode) {
			this.setElementValue(
				this.managedItems.ldap_experienced_admin.$element, xpAdminMode
			);
		},

		/**
		 * updates the tab when the model loaded a configuration and notified
		 * this view.
		 *
		 * @param {WizardTabElementary} view - this instance
		 * @param {Object} configuration
		 */
		onConfigLoaded: function(view, configuration) {
			console.log('Elementary received config');

			for(var key in view.managedItems){
				if(!_.isUndefined(configuration[key])) {
					var value = configuration[key];
					var methodName = view.managedItems[key].setMethod;
					view[methodName](value);
				}
			}
		},

		/**
		 * reacts on a set action on the model and updates the tab with the
		 * valid value.
		 *
		 * @param {WizardTabElementary} view
		 * @param {Object} result
		 */
		onItemSaved: function(view, result) {
			if(!_.isUndefined(view.managedItems[result.key])) {
				var methodName = view.managedItems[result.key].setMethod;
				view[methodName](result.value);
				if(!result.isSuccess) {
					console.log(result.errorMessage);
				}
			}
		},

		/**
		 * updates the configuration chooser when a new configuration was added
		 * which also means it is being switched to. The configuration fields
		 * are updated on a different step.
		 *
		 * @param {WizardTabElementary} view
		 * @param {Object} result
		 */
		onNewConfiguration: function(view, result) {
			if(result.isSuccess === true) {
				$(view.configChooserID + ' option:selected').removeAttr('selected');
				var html = '<option value="'+result.configPrefix+'" selected="selected">'+t('user_ldap','{nthServer}. Server', {nthServer: $(view.configChooserID + ' option').length})+'</option>';
				$(view.configChooserID + ' option:last').before(html);
			}
		},

		/**
		 * updates the configuration chooser upon the deletion of a
		 * configuration and, if necessary, loads an existing one.
		 *
		 * @param view
		 * @param result
		 */
		onDeleteConfiguration: function(view, result) {
			console.log(result);
			if(result.isSuccess === true) {
				if(view.getConfigID() === result.configPrefix) {
					// if the deleted value is still the selected one (99% of
					// the cases), remove it from the list and load the topmost
					$(view.configChooserID + ' option:selected').remove();
					$(view.configChooserID + ' option:first').select();
					if($(view.configChooserID +  ' option').length < 2) {
						view.configModel.newConfig(false);
					} else {
						view.configModel.load(view.getConfigID());
					}
				} else {
					// otherwise just remove the entry
					$(view.configChooserID + ' option[value=' + result.configPrefix + ']').remove();
				}
			} else {
				OC.Notification.showTemporary(result.errorMessage);
			}
		},

		/**
		 * registers the change event on the configuration chooser and makes
		 * the model load a newly selected configuration
		 *
		 * @private
		 */
		_enableConfigChooser: function() {
			var view = this;
			$(this.configChooserID).change(function(){
				var value = $(view.configChooserID + ' option:selected:first').attr('value');
				if(value !== 'NEW') {
					view.configModel.load(value);
				} else {
					OC.dialogs.confirm(
						t('user_ldap', 'Take over settings from recent server configuration?'),
						t('user_ldap', 'Keep settings?'),
						function(doCopy) {
							view.configModel.newConfig(doCopy);
						},
						false
					);
				}
			});
		},

		/**
		 * adds actions to the action buttons for configuration management
		 *
		 * @private
		 */
		_enableConfigButtons: function() {
			var view = this;
			$('#ldap_action_delete_configuration').click(function(event) {
				event.preventDefault();
				OC.dialogs.confirm(
					t('user_ldap', 'Do you really want to delete the current Server Configuration?'),
					t('user_ldap', 'Confirm Deletion'),
					function(doDelete) {
						if(doDelete) {
							view.configModel.deleteConfig(view.getConfigID());
						}
					},
					false
				);
			});
		}
	});

	OCA.LDAP.Wizard.WizardTabElementary = WizardTabElementary;
})();
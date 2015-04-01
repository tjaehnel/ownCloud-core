/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OCA = OCA || {};

(function() {

	/**
	 * @classdesc This class represents the view belonging to the login filter
	 * tab in the LDAP wizard.
	 */
	var WizardTabLoginFilter = OCA.LDAP.Wizard.WizardTabGeneric.subClass({
		/**
		 * initializes the instance. Always call it after initialization.
		 *
		 * @param tabIndex
		 * @param tabID
		 */
		init: function (tabIndex, tabID) {
			this._super(tabIndex, tabID);

			var items = {
				ldap_loginfilter_username: {
					$element: $('#ldap_loginfilter_username'),
					setMethod: 'setLoginAttributeUsername'
				},
				ldap_loginfilter_email: {
					$element: $('#ldap_loginfilter_email'),
					setMethod: 'setLoginAttributeEmail'
				},
				ldap_login_filter_mode: {
					setMethod: 'setFilterMode'
				},
				ldap_loginfilter_attributes: {
					$element: $('#ldap_loginfilter_attributes'),
					setMethod: 'setLoginAttributesOther'
				},
				ldap_login_filter: {
					$element: $('#ldap_login_filter'),
					setMethod: 'setLoginFilter'
				},
				loginFilterRawToggle: {
					$element: $('#toggleRawLoginFilter')
				},
				loginFilterRawContainer: {
					$element: $('#rawLoginFilterContainer')
				}
			};
			this.setManagedItems(items);

			this.filterModeKey = 'ldapLoginFilterMode';
			this._initMultiSelect(
				this.managedItems.ldap_loginfilter_attributes.$element,
				t('user_ldap', 'Select attributes')
			);
			this._initFilterModeSwitcher(
				this.managedItems.loginFilterRawToggle.$element,
				this.managedItems.loginFilterRawContainer.$element,
				[
					this.managedItems.ldap_loginfilter_username.$element,
					this.managedItems.ldap_loginfilter_email.$element,
					this.managedItems.ldap_loginfilter_attributes.$element
				],
				'ldap_login_filter_mode'
			);
		},

		/**
		 * Sets the config model for this view and subscribes to some events.
		 * Also binds the config chooser to the model
		 *
		 * @param {OCA.LDAP.Wizard.ConfigModel} configModel
		 */
		setModel: function(configModel) {
			this._super(configModel);
			this.configModel.on('configLoaded', this.onConfigSwitch, this);
			this.configModel.on('configUpdated', this.onConfigLoaded, this);
			this.configModel.on('receivedLdapFeature', this.onFeatureReceived, this);
		},

		/**
		 * sets the selected attributes
		 *
		 * @param {Array} attributes
		 */
		setLoginAttributesOther: function(attributes) {
			this.setElementValue(this.managedItems.ldap_loginfilter_attributes.$element, attributes);
			this.managedItems.ldap_loginfilter_attributes.$element.multiselect('refresh');
		},

		/**
		 * sets the login list filter
		 *
		 * @param {string} filter
		 */
		setLoginFilter: function(filter) {
			this.setElementValue(this.managedItems.ldap_login_filter.$element, filter);
			this.$filterModeRawContainer.siblings('.ldapReadOnlyFilterContainer').find('.ldapFilterReadOnlyElement').text(filter);
		},

		/**
		 * updates the username attribute check box
		 *
		 * @param {string} useUsername contains an int
		 */
		setLoginAttributeUsername: function(useUsername) {
			this.setElementValue(
				this.managedItems.ldap_loginfilter_username.$element, useUsername
			);
		},

		/**
		 * updates the email attribute check box
		 *
		 * @param {string} useEmail contains an int
		 */
		setLoginAttributeEmail: function(useEmail) {
			this.setElementValue(
				this.managedItems.ldap_loginfilter_email.$element, useEmail
			);
		},

		/**
		 * @inheritdoc
		 */
		considerFeatureRequests: function() {
			if(this.managedItems.ldap_loginfilter_attributes.$element.find('option').length === 0) {
				this.disableElement(this.managedItems.ldap_loginfilter_attributes.$element);
				if(this.parsedFilterMode === this.configModel.FILTER_MODE_ASSISTED) {
					this.configModel.requestWizard('ldap_loginfilter_attributes');
				}
			}
		},

		/**
		 * resets the view when a configuration switch happened.
		 *
		 * @param {WizardTabLoginFilter} view
		 * @param {Object} configuration
		 */
		onConfigSwitch: function(view, configuration) {
			view.managedItems.ldap_loginfilter_attributes.$element.find('option').remove();

			view.onConfigLoaded(view, configuration);
		},

		/**
		 * updates the tab when the model loaded a configuration and notified
		 * this view.
		 *
		 * @param {WizardTabLoginFilter} view - this instance
		 * @param {Object} configuration
		 *
		 * TODO: move to Generic?!
		 */
		onConfigLoaded: function(view, configuration) {
			for(var key in view.managedItems){
				if(!_.isUndefined(configuration[key])) {
					var value = configuration[key];
					var methodName = view.managedItems[key].setMethod;
					if(!_.isUndefined(view[methodName])) {
						view[methodName](value);
					}
				}
			}
		},

		/**
		 * reacts on a set action on the model and updates the tab with the
		 * valid value.
		 *
		 * @param {WizardTabLoginFilter} view
		 * @param {Object} result
		 *
		 * TODO: move to generic?!
		 */
		onItemSaved: function(view, result) {
			if(!_.isUndefined(view.managedItems[result.key])) {
				var methodName = view.managedItems[result.key].setMethod;
				view[methodName](result.value);
				if(!result.isSuccess) {
					console.log(result.errorMessage);
					// TODO show notification (if we are active tab?)
				}
			}
		},

		/**
		 * if UserObjectClasses are found, the corresponding element will be
		 * updated
		 *
		 * @param {WizardTabLoginFilter} view
		 * @param {FeaturePayload} payload
		 */
		onFeatureReceived: function(view, payload) {
			if(payload.feature === 'AvailableAttributes') {
				view.equipMultiSelect(view.managedItems.ldap_loginfilter_attributes.$element, payload.data);
			}
		}

	});

	OCA.LDAP.Wizard.WizardTabLoginFilter = WizardTabLoginFilter;
})();
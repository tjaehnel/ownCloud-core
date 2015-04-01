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
	var WizardTabUserFilter = OCA.LDAP.Wizard.WizardTabGeneric.subClass({
		/**
		 * initializes the instance. Always call it after initialization.
		 *
		 * @param tabIndex
		 * @param tabID
		 */
		init: function (tabIndex, tabID) {
			this._super(tabIndex, tabID);

			var items = {
				ldap_userfilter_objectclass: {
					$element: $('#ldap_userfilter_objectclass'),
					setMethod: 'setObjectClass'
				},
				ldap_user_filter_mode: {
					setMethod: 'setFilterMode'
				},
				ldap_userfilter_groups: {
					$element: $('#ldap_userfilter_groups'),
					setMethod: 'setGroups'
				},
				ldap_userlist_filter: {
					$element: $('#ldap_userlist_filter'),
					setMethod: 'setUserFilter'
				},
				userFilterRawToggle: {
					$element: $('#toggleRawUserFilter')
				},
				userFilterRawContainer: {
					$element: $('#rawUserFilterContainer')
				},
				ldap_user_count: {
					$element: $('#ldap_user_count'),
					$relatedElements: $('.ldapGetUserCount'),
					setMethod: 'setUserCount'
				}
			};
			this.setManagedItems(items);

			this.filterModeKey = 'ldapUserFilterMode';
			this._initMultiSelect(
				this.managedItems.ldap_userfilter_groups.$element,
				t('user_ldap', 'Select groups')
			);
			this._initMultiSelect(
				this.managedItems.ldap_userfilter_objectclass.$element,
				t('user_ldap', 'Select object classes')
			);
			this.filterName = 'ldap_userlist_filter';
			this._initFilterModeSwitcher(
				this.managedItems.userFilterRawToggle.$element,
				this.managedItems.userFilterRawContainer.$element,
				[ this.managedItems.ldap_userfilter_objectclass.$element ],
				'ldap_user_filter_mode',
				{
					status: 'disabled',
					$element: this.managedItems.ldap_userfilter_groups.$element
				}
			);
			_.bindAll(this, 'onCountButtonClick');
			this.managedItems.ldap_user_count.$relatedElements.click(this.onCountButtonClick);
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
		 * sets the selected user object classes
		 *
		 * @param {Array} classes
		 */
		setObjectClass: function(classes) {
			this.setElementValue(this.managedItems.ldap_userfilter_objectclass.$element, classes);
			this.managedItems.ldap_userfilter_objectclass.$element.multiselect('refresh');
		},

		/**
		 * sets the selected groups
		 *
		 * @param {Array} groups
		 */
		setGroups: function(groups) {
			this.setElementValue(this.managedItems.ldap_userfilter_groups.$element, groups);
			this.managedItems.ldap_userfilter_groups.$element.multiselect('refresh');
		},

		/**
		 * sets the user list filter
		 *
		 * @param {string} filter
		 */
		setUserFilter: function(filter) {
			this.setElementValue(this.managedItems.ldap_userlist_filter.$element, filter);
			this.$filterModeRawContainer.siblings('.ldapReadOnlyFilterContainer').find('.ldapFilterReadOnlyElement').text(filter);
		},

		/**
		 * sets the user count string
		 *
		 * @param {string} resultString
		 */
		setUserCount: function(countInfo) {
			this.setElementValue(this.managedItems.ldap_user_count.$element, countInfo);
			console.log('user count set');
		},

		/**
		 * @inheritdoc
		 */
		overrideErrorMessage: function(message, key) {
			if(   key === 'ldap_userfilter_groups'
			   && message === 'memberOf is not supported by the server'
			) {
				message = t('user_ldap', 'The group box was disabled, because the LDAP / AD server does not support memberOf.');
			}
			return message;
		},

		/**
		 * @inheritdoc
		 */
		considerFeatureRequests: function() {
			if(!this.isActive) {
				return;
			}
			if(this.managedItems.ldap_userfilter_objectclass.$element.find('option').length === 0) {
				this.disableElement(this.managedItems.ldap_userfilter_objectclass.$element);
				this.disableElement(this.managedItems.ldap_userfilter_groups.$element);
				if(this.parsedFilterMode === this.configModel.FILTER_MODE_ASSISTED) {
					this.configModel.requestWizard('ldap_userfilter_objectclass');
					this.configModel.requestWizard('ldap_userfilter_groups');
				}
			}
		},

		/**
		 * @inheritdoc
		 */
		onActivate: function() {
			this.considerFeatureRequests();
		},

		/**
		 * resets the view when a configuration switch happened.
		 *
		 * @param {WizardTabUserFilter} view
		 * @param {Object} configuration
		 */
		onConfigSwitch: function(view, configuration) {
			view.managedItems.ldap_userfilter_objectclass.$element.find('option').remove();
			view.managedItems.ldap_userfilter_groups.$element.find('option').remove();
			view.managedItems.ldap_user_count.$element.text('');

			view.onConfigLoaded(view, configuration);
		},

		/**
		 * updates the tab when the model loaded a configuration and notified
		 * this view.
		 *
		 * @param {WizardTabUserFilter} view - this instance
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
		 * @param {WizardTabElementary} view
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
		 * @param {WizardTabUserFilter} view
		 * @param {FeaturePayload} payload
		 */
		onFeatureReceived: function(view, payload) {
			if(payload.feature === 'UserObjectClasses') {
				view.equipMultiSelect(view.managedItems.ldap_userfilter_objectclass.$element, payload.data);
			} else if (payload.feature === 'GroupsForUsers') {
				view.equipMultiSelect(view.managedItems.ldap_userfilter_groups.$element, payload.data);
			}
		},

		/**
		 * request to count the users with the current filter
		 *
		 * @param {Event} event
		 */
		onCountButtonClick: function(event) {
			event.preventDefault();
			// let's clear the field
			this.managedItems.ldap_user_count.$element.text('');
			this.configModel.requestWizard('ldap_user_count');
		}

	});

	OCA.LDAP.Wizard.WizardTabUserFilter = WizardTabUserFilter;
})();
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
			this.setManagedItems({
/*				ldap_userfilter_objectclass: 'setObjectClass',
				ldap_userfilter_groups: 'setGroups',
				ldap_userlist_filter: 'setFilter',
				ldap_user_count: 'setUserCount',*/
				ldap_user_filter_mode: 'setFilterMode'
			});
			this.jqObjects = {
				userFilterGroups: $('#ldap_userfilter_groups'),
				userFilterObjectClasses: $('#ldap_userfilter_objectclass'),
				userFilterRawToggle: $('#toggleRawUserFilter'),
				userFilterRawContainer: $('#rawUserFilterContainer')
			};
			this.filterModeKey = 'ldapUserFilterMode';
			this._initMultiSelect(
				this.jqObjects.userFilterGroups,
				t('user_ldap', 'Select groups')
			);
			this._initMultiSelect(
				this.jqObjects.userFilterObjectClasses,
				t('user_ldap', 'Select object classes')
			);
			this._initFilterModeSwitcher(
				this.jqObjects.userFilterRawToggle,
				this.jqObjects.userFilterRawContainer,
				[ this.jqObjects.userFilterObjectClasses ],
				'ldap_user_filter_mode',
				{ status: 'disabled', $element: this.jqObjects.userFilterGroups }
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
			this.configModel.on('configLoaded', this.onConfigLoaded, this);
			this.configModel.on('configUpdated', this.onConfigLoaded, this);
		},

		/**
		 * updates the tab when the model loaded a configuration and notified
		 * this view.
		 *
		 * @param {WizardTabElementary} view - this instance
		 * @param {Object} configuration
		 *
		 * TODO: move to Generic?!
		 */
		onConfigLoaded: function(view, configuration) {
			for(var key in view.managedItems){
				if(!_.isUndefined(configuration[key])) {
					var value = configuration[key];
					var methodName = view.managedItems[key];
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
		 *
		 * TODO: move to generic?!
		 */
		onItemSaved: function(view, result) {
			if(!_.isUndefined(view.managedItems[result.key])) {
				var methodName = view.managedItems[result.key];
				view[methodName](result.value);
				if(!result.isSuccess) {
					console.log(result.errorMessage);
					// TODO show notification (if we are active tab?)
				}
			}
		}
	});

	OCA.LDAP.Wizard.WizardTabUserFilter = WizardTabUserFilter;
})();
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
				userFilterGroups: {
					$element: $('#ldap_userfilter_groups')
				},
				userFilterRawToggle: {
					$element: $('#toggleRawUserFilter')
				},
				userFilterRawContainer: {
					$element: $('#rawUserFilterContainer')
				}
			};
			/*ldap_userfilter_groups: 'setGroups',
			 ldap_userlist_filter: 'setFilter',
			 ldap_user_count: 'setUserCount',*/
			this.setManagedItems(items);

			this.filterModeKey = 'ldapUserFilterMode';
			this._initMultiSelect(
				this.managedItems.userFilterGroups.$element,
				t('user_ldap', 'Select groups')
			);
			this._initMultiSelect(
				this.managedItems.ldap_userfilter_objectclass.$element,
				t('user_ldap', 'Select object classes')
			);
			this._initFilterModeSwitcher(
				this.managedItems.userFilterRawToggle.$element,
				this.managedItems.userFilterRawContainer.$element,
				[ this.managedItems.ldap_userfilter_objectclass.$element ],
				'ldap_user_filter_mode',
				{
					status: 'disabled',
					$element: this.managedItems.userFilterGroups.$element
				}
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
		 * populate objectClasses, when…
		 * - this tab is being activated
		 * - AND they are not populated yet
		 */
		onActivate: function() {
			if(this.managedItems.ldap_userfilter_objectclass.$element.find('option').length === 0) {
				this.configModel.requestWizard('ldap_userfilter_objectclass');
			}
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
				view.managedItems.ldap_userfilter_objectclass.$element.find('option').remove();
				for (var i in payload.data) {
					//FIXME: move HTML into template
					var name = payload.data[i];
					var entry = "<option value='" + name + "'>" + name + "</option>";
					view.managedItems.ldap_userfilter_objectclass.$element.append(entry);
				}
				view.managedItems.ldap_userfilter_objectclass.$element.multiselect('refresh');
			}
		}
	});

	OCA.LDAP.Wizard.WizardTabUserFilter = WizardTabUserFilter;
})();
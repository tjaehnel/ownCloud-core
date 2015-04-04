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
	var WizardTabAbstractFilter = OCA.LDAP.Wizard.WizardTabGeneric.subClass({
		/**
		 * @property {number} number that needs to exceeded to use complex group
		 * selection element
		 */
		_groupElementSwitchThreshold: 40,

		/**
		 * tells whether multiselect or complex element is used for selecting
		 * groups
		 */
		isComplexGroupChooser: false,

		/**
		 * initializes the instance. Always call it after initialization.
		 * concrete view must set managed items first, and then call the parent
		 * init.
		 *
		 * @param {OCA.LDAP.Wizard.FilterOnTypeFactory} fotf
		 * @param {number} [tabIndex]
		 * @param {string} [tabID]
		 */
		init: function (fotf, tabIndex, tabID) {
			this._super(tabIndex, tabID);

			this.foTFactory = fotf;
			this._initMultiSelect(
				this.getGroupsItem().$element,
				t('user_ldap', 'Select groups')
			);
			this._initMultiSelect(
				this.getObjectClassItem().$element,
				t('user_ldap', 'Select object classes')
			);
			this.filterName = this.getFilterItem().keyName;
			this._initFilterModeSwitcher(
				this.getToggleItem().$element,
				this.getRawFilterContainerItem().$element,
				[ this.getObjectClassItem().$element ],
				this.getFilterModeKey(),
				{
					status: 'disabled',
					$element: this.getGroupsItem().$element
				}
			);
			_.bindAll(this, 'onCountButtonClick',  'onSelectGroup', 'onDeselectGroup');
			this.getCountItem().$relatedElements.click(this.onCountButtonClick);
			if(this.manyGroupsSupport) {
				var $selectBtn = $(this.tabID).find('.ldapGroupListSelect');
				$selectBtn.click(this.onSelectGroup);
				var $deselectBtn = $(this.tabID).find('.ldapGroupListDeselect');
				$deselectBtn.click(this.onDeselectGroup);
			}
		},

		/**
		 * returns managed item for the object class chooser. must be
		 * implemented by concrete view
		 */
		getObjectClassItem: function () {},

		/**
		 * returns managed item for the group chooser. must be
		 * implemented by concrete view
		 */
		getGroupsItem: function () {},

		/**
		 * returns managed item for the effective filter. must be
		 * implemented by concrete view
		 */
		getFilterItem: function () {},

		/**
		 * returns managed item for the toggle element. must be
		 * implemented by concrete view
		 */
		getToggleItem: function () {},

		/**
		 * returns managed item for the raw filter container. must be
		 * implemented by concrete view
		 */
		getRawFilterContainerItem: function () {},

		/**
		 * returns managed item for the count control. must be
		 * implemented by concrete view
		 */
		getCountItem: function () {},

		/**
		 * returns name of the filter mode key. must be implemented by concrete
		 * view
		 */
		getFilterModeKey: function () {},

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
		 * @inheritdoc
		 */
		_setFilterModeAssisted: function () {
			this._super();
			if(this.isComplexGroupChooser) {
				this.enableElement(this.getGroupsItem().$relatedElements);
			}
		},

		/**
		 * @inheritdoc
		 */
		_setFilterModeRaw: function () {
			this._super();
			if(this.manyGroupsSupport) {
				this.disableElement(this.getGroupsItem().$relatedElements);
			}
		},

		/**
		 * sets the selected user object classes
		 *
		 * @param {Array} classes
		 */
		setObjectClass: function(classes) {
			this.setElementValue(this.getObjectClassItem().$element, classes);
			this.getObjectClassItem().$element.multiselect('refresh');
		},

		/**
		 * sets the selected groups
		 *
		 * @param {Array} groups
		 */
		setGroups: function(groups) {
			if(!this.isComplexGroupChooser) {
				this.setElementValue(this.getGroupsItem().$element, groups);
				this.getGroupsItem().$element.multiselect('refresh');
			} else {
				var $element = $(this.tabID).find('.ldapGroupListSelected');
				this.equipMultiSelect($element, groups);
			}
		},

		/**
		 * sets the filter
		 *
		 * @param {string} filter
		 */
		setFilter: function(filter) {
			this.setElementValue(this.getFilterItem().$element, filter);
			this.$filterModeRawContainer.siblings('.ldapReadOnlyFilterContainer').find('.ldapFilterReadOnlyElement').text(filter);
		},

		/**
		 * sets the user count string
		 *
		 * @param {string} resultString
		 */
		setCount: function(countInfo) {
			this.setElementValue(this.getCountItem().$element, countInfo);
		},

		/**
		 * @inheritdoc
		 */
		considerFeatureRequests: function() {
			if(!this.isActive) {
				return;
			}
			if(this.getObjectClassItem().$element.find('option').length === 0) {
				this.disableElement(this.getObjectClassItem().$element);
				this.disableElement(this.getGroupsItem().$element);
				if(this.parsedFilterMode === this.configModel.FILTER_MODE_ASSISTED) {
					this.configModel.requestWizard(this.getObjectClassItem().keyName);
					this.configModel.requestWizard(this.getGroupsItem().keyName);
				}
			}
		},

		/**
		 * updates (creates, if necessary) filterOnType instances
		 */
		updateFilterOnType: function() {
			if(_.isUndefined(this.filterOnType)) {
				this.filterOnType = [];

				var $availableGroups = $(this.tabID).find('.ldapGroupListAvailable');
				this.filterOnType.push(this.foTFactory.get(
					$availableGroups, $(this.tabID).find('.ldapManyGroupsSearch')
				));
				var $selectedGroups  = $(this.tabID).find('.ldapGroupListSelected');
				this.filterOnType.push(this.foTFactory.get(
					$selectedGroups, $(this.tabID).find('.ldapManyGroupsSearch')
				));
			} else {
				$(this.filterOnType).each(function() { this.updateOptions(); });
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
		 * @param {WizardTabAbstractFilter} view
		 * @param {Object} configuration
		 */
		onConfigSwitch: function(view, configuration) {
			view.getObjectClassItem().$element.find('option').remove();
			view.getGroupsItem().$element.find('option').remove();
			view.getCountItem().$element.text('');
			$(view.tabID).find('.ldapGroupListAvailable').empty();
			$(view.tabID).find('.ldapGroupListSelected').empty();
			view.updateFilterOnType();
			$(view.tabID).find('.ldapManyGroupsSearch').val('');

			if(view.isComplexGroupChooser) {
				view.isComplexGroupChooser = false;
				view.getGroupsItem().$element.multiselect({classes: view.multiSelectPluginClass});
				$(view.tabID).find(".ldapManyGroupsSupport").addClass('hidden');
			}

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
		 * @param {WizardTabAbstractFilter} view
		 * @param {FeaturePayload} payload
		 */
		onFeatureReceived: function(view, payload) {
			if(payload.feature === view.getObjectClassItem().featureName) {
				view.equipMultiSelect(view.getObjectClassItem().$element, payload.data);
			} else if (payload.feature === view.getGroupsItem().featureName) {
				if(view.manyGroupsSupport && payload.data.length > view._groupElementSwitchThreshold) {
					// we need to fill the left list box, excluding the values
					// that are already selected
					var $element = $(view.tabID).find('.ldapGroupListAvailable');
					var selected = view.configModel.configuration[view.getGroupsItem().keyName];
					var available = $(payload.data).not(selected).get();
					view.equipMultiSelect($element, available);
					view.updateFilterOnType();
					$(view.tabID).find(".ldapManyGroupsSupport").removeClass('hidden');
					view.getGroupsItem().$element.multiselect({classes: view.multiSelectPluginClass + ' forceHidden'});
					view.isComplexGroupChooser = true;
				} else {
					view.isComplexGroupChooser = false;
					view.equipMultiSelect(view.getGroupsItem().$element, payload.data);
					view.getGroupsItem().$element.multiselect({classes: view.multiSelectPluginClass});
					$(view.tabID).find(".ldapManyGroupsSupport").addClass('hidden');

				}
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
			this.getCountItem().$element.text('');
			this.configModel.requestWizard(this.getCountItem().keyName);
		},

		/**
		 * saves groups when using the complex UI
		 *
		 * @param {Array} groups
		 * @returns {boolean}
		 * @private
		 */
		_saveGroups: function(groups) {
			var toSave = '';
			$(groups).each(function() { toSave = toSave + "\n" + this; } );
			this.configModel.set(this.getGroupsItem().keyName, $.trim(toSave));
		},

		/**
		 * acts on adding groups to the filter
		 */
		onSelectGroup: function() {
			var $available = $(this.tabID).find('.ldapGroupListAvailable');
			var $selected = $(this.tabID).find('.ldapGroupListSelected');
			var selected = $.map($selected.find('option'), function(e) { return e.value; });

			this._saveGroups(selected.concat($available.val()));
			$available.find('option:selected').prependTo($selected);
			this.updateFilterOnType();
		},

		/**
		 * acts on removing groups to the filter
		 */
		onDeselectGroup: function() {
			var $available = $(this.tabID).find('.ldapGroupListAvailable');
			var $selected = $(this.tabID).find('.ldapGroupListSelected');
			var selected = $.map($selected.find('option:not(:selected)'), function(e) { return e.value; });

			this._saveGroups(selected);
			$selected.find('option:selected').appendTo($available);
			this.updateFilterOnType();
		}

	});

	OCA.LDAP.Wizard.WizardTabAbstractFilter = WizardTabAbstractFilter;
})();

/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OCA = OCA || {};

(function() {

	/**
	 * @classdesc An abstract tab view
	 * @abstract
	 */
	var WizardTabGeneric = OCA.LDAP.Wizard.WizardObject.subClass({
		/** @inheritdoc */
		init: function(tabIndex, tabID) {
			this.tabIndex = tabIndex;
			this.tabID = tabID;
			this.spinner = $('.ldapSpinner').first().clone().removeClass('hidden');
			_.bindAll(this, '_toggleRawFilterMode');
		},

		/**
		 * sets the configuration items that are managed by that view.
		 *
		 * The parameter contains key-value pairs the key being the
		 * configuration keys and the value being its setter method.
		 *
		 * @param {object} managedItems
		 */
		setManagedItems: function(managedItems) {
			this.managedItems = managedItems;
			this._enableAutoSave();
		},

		/**
		 * Sets the config model. The concrete view likely wants to subscribe
		 * to events as well.
		 *
		 * @param {OCA.LDAP.Wizard.ConfigModel} configModel
		 */
		setModel: function(configModel) {
			this.configModel = configModel;
		},

		/**
		 * sets the value to an HTML element. Checkboxes, text areas and (text)
		 * input fields are supported.
		 *
		 * @param {jQuery} $element - the target element
		 * @param {string|number} value
		 */
		setElementValue: function($element, value) {
			//var $element = $(elementID);
			// deal with check box
			if($element.is('input[type=checkbox]')) {
				this._setCheckBox($element, value);
				return;
			}

			// deal with text area
			if($element.is('textarea') && $.isArray(value)) {
				value = value.join("\n");
			}
			$element.val(value);
		},

		/**
		 * enables the specified HTML element
		 *
		 * @param {jQuery} $element
		 */
		enableElement: function($element) {
			if($element.is('select[multiple]')) {
				$element.multiselect("enable");
			} else {
				$element.prop('disabled', false);
			}
		},

		/**
		 * disables the specified HTML element
		 *
		 * @param {jQuery} $element
		 */
		disableElement: function($element) {
			if($element.is('select[multiple]')) {
				$element.multiselect("disable");
			} else {
				$element.prop('disabled', 'disabled');
			}
		},

		/**
		 * attaches a spinner icon to the HTML element specified by ID
		 *
		 * @param {string} elementID
		 */
		attachSpinner: function(elementID) {
			if($(elementID + ' + .ldapSpinner').length == 0) {
				var spinner = this.spinner.clone();
				$(spinner).insertAfter($(elementID));
				//$(elementID + " + img + button").css('display', 'none'); ???
			}
		},

		/**
		 * removes the spinner icon from the HTML element specified by ID
		 *
		 * @param {string} elementID
		 */
		removeSpinner: function(elementID) {
			$(elementID+' + .ldapSpinner').remove();
			//$(elementID + " + button").css('display', 'inline'); ???
		},

		/**
		 * sets up auto-save functionality to the managed items
		 *
		 * @private
		 */
		_enableAutoSave: function() {
			var view = this;

			for(var id in this.managedItems) {
				$('#' + id).change(function() {
					view._requestSave($(this));
				});
			}
		},

		/**
		 * initializes a multiSelect element
		 *
		 * @param {jQuery} $element
		 * @param {string} caption
		 * @private
		 */
		_initMultiSelect: function($element, caption) {
			var view = this;
			$element.multiselect({
				header: false,
				selectedList: 9,
				noneSelectedText: caption,
				click: function() {
					// FIXME: let's do it after close instead
					view._requestSave($element);
				}
			});
		},

		/**
		 * @typedef {object} viewSaveInfo
		 * @property {function} val
		 * @property {function} attr
		 * @property {function} is
		 */

		/**
		 * requests a save operation from the model for a given value
		 * represented by a HTML element and its ID.
		 *
		 * @param {jQuery|viewSaveInfo} $element
		 * @private
		 */
		_requestSave: function($element) {
			var value = '';
			if($element.is('input[type=checkbox]')
				&& !$element.is(':checked')) {
				value = 0;
			} else if ($element.is('select[multiple]')) {
				var entries = $element.multiselect("getChecked");
				for(var i = 0; i < entries.length; i++) {
					value = value + "\n" + entries[i].value;
				}
				value = $.trim(value);
			} else {
				value = $element.val();
			}
			console.log('attempt to set ' + $element.attr('id') + ' to ' + value);
			this.configModel.set($element.attr('id'), value);
			//TODO react on if set returned false
		},

		/**
		 * updates a checkbox element according to the provided value
		 *
		 * @param {jQuery} $element
		 * @param {string|number} value
		 * @private
		 */
		_setCheckBox: function($element, value) {
			if(parseInt(value, 10) === 1) {
				$element.attr('checked', 'checked');
			} else {
				$element.removeAttr('checked');
			}
		},

		/**
		 * sets the filter mode according to the provided configuration value
		 *
		 * @param {string} mode
		 */
		setFilterMode: function(mode) {
			if(parseInt(mode, 10) === this.configModel.FILTER_MODE_ASSISTED) {
				this._setFilterModeAssisted();
			} else {
				this._setFilterModeRaw();
			}
		},

		/**
		 * updates the UI so that it represents the assisted mode setting
		 *
		 * @private
		 */
		_setFilterModeAssisted: function() {
			var view = this;

			this.$filterModeRawContainer.addClass('invisible');
			$.each(this.filterModeDisableableElements, function(i, $element) {
				view.enableElement($element);
			});
			if(this.filterModeStateElement.status === 'enabled') {
				this.enableElement(this.filterModeStateElement.$element);
			} else {
				this.filterModeStateElement.status = 'disabled';
			}
		},

		/**
		 * updates the UI so that it represents the raw mode setting
		 *
		 * @private
		 */
		_setFilterModeRaw: function() {
			var view = this;

			this.$filterModeRawContainer.removeClass('invisible');
			$.each(this.filterModeDisableableElements, function (i, $element) {
				view.disableElement($element);
			});

			if(!_.isUndefined(this.filterModeStateElement)) {
				if(this.filterModeStateElement.$element.multiselect().attr('disabled') === 'disabled') {
					this.filterModeStateElement.status = 'disabled';
				} else {
					this.filterModeStateElement.status = 'enabled';
				}
			}
			this.disableElement(this.filterModeStateElement.$element);
		},

		/**
		 * toggles the visibility of a raw filter container and so also the
		 * state of the multi-select controls. The model is requested to save
		 * the state.
		 */
		_toggleRawFilterMode: function() {
			/** var {number} */
			var mode;
			var view = this;
			if(this.$filterModeRawContainer.hasClass('invisible')) {
				this._setFilterModeRaw();
				mode = this.configModel.FILTER_MODE_RAW;
			} else {
				this._setFilterModeAssisted();
				mode = this.configModel.FILTER_MODE_ASSISTED;
			}
			var key = this.filterModeKey;
			/** @var {viewSaveInfo} */
			var saveInfo = {
				val:  function() { return mode;  },
				attr: function() { return key;   },
				is:   function() { return false; }
			};
			this._requestSave(saveInfo);
			//TODO: use ldapFilter.setMode()
		},

		/**
		 * @typedef {object} filterModeStateElementObj
		 * @property {string} status - either "enabled" or "disabled"
		 * @property {jQuery} $element
		 */

		/**
		 * initializes a raw filter mode switcher
		 *
		 * @param {jQuery} $switcher - the element receiving the click
		 * @param {jQuery} $filterModeRawContainer - contains the raw filter
		 * input elements
		 * @param {jQuery[]} filterModeDisableableElements - an array of elements
		 * not belonging to the raw filter part that shall be en/disabled.
		 * @param {string} filterModeKey - the setting key that save the state
		 * of the mode
		 * @param {filterModeStateElementObj} [filterModeStateElement] - one element
		 * which status (enabled or not) is tracked by a setting
		 * @private
		 */
		_initFilterModeSwitcher: function(
			$switcher,
			$filterModeRawContainer,
			filterModeDisableableElements,
			filterModeKey,
			filterModeStateElement
		) {
			this.$filterModeRawContainer = $filterModeRawContainer;
			this.filterModeDisableableElements = filterModeDisableableElements;
			this.filterModeStateElement = filterModeStateElement;
			this.filterModeKey = filterModeKey;
			$switcher.click(this._toggleRawFilterMode);
		}

	});

	OCA.LDAP.Wizard.WizardTabGeneric = WizardTabGeneric;
})();

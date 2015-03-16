
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
			$element.prop('disabled', false);
		},

		/**
		 * disables the specified HTML element
		 *
		 * @param {jQuery} $element
		 */
		disableElement: function($element) {
			$element.prop('disabled', 'disabled');
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
		 * requests a save operation from the model for a given value
		 * represented by a HTML element and its ID.
		 *
		 * @param {jQuery} $element
		 * @private
		 */
		_requestSave: function($element) {
			var value;
			if($element.is('input[type=checkbox]')
				&& !$element.is(':checked')) {
				value = 0;
			} else {
				value = $element.val();
			}
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
		}

	});

	OCA.LDAP.Wizard.WizardTabGeneric = WizardTabGeneric;
})();

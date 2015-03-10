
/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OCA = OCA || {};

(function() {

	var WizardTabGeneric = OCA.LDAP.Wizard.WizardObject.subClass({
		init: function(tabIndex, tabID) {
			this.tabIndex = tabIndex;
			this.tabID = tabID;
			this.spinner = $('.ldapSpinner').first().clone().removeClass('hidden');
		},

		setManagedItems: function(managedItems) {
			this.managedItems = managedItems;
			this._enableAutoSave();
		},

		setModel: function(configModel) {
			this.configModel = configModel;
		},

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

		enableElement: function($element) {
			$element.prop('disabled', false);
		},

		disableElement: function($element) {
			$element.prop('disabled', 'disabled');
		},

		attachSpinner: function(elementID) {
			if($(elementID + ' + .ldapSpinner').length == 0) {
				var spinner = this.spinner.clone();
				$(spinner).insertAfter($(elementID));
				//$(elementID + " + img + button").css('display', 'none'); ???
			}
		},

		removeSpinner: function(elementID) {
			$(elementID+' + .ldapSpinner').remove();
			//$(elementID + " + button").css('display', 'inline'); ???
		},

		_enableAutoSave: function() {
			var view = this;

			for(var id in this.managedItems) {
				$('#' + id).change(function() {
					view._requestSave($(this));
				});
			}
		},

		_requestSave: function($element) {
			var value;
			if($element.is('input[type=checkbox]')
				&& !$element.is(':checked')) {
				value = 0;
			} else {
				value = $element.val();
			}
			//TODO: show spinner
			this.configModel.set($element.attr('id'), value);
		},

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

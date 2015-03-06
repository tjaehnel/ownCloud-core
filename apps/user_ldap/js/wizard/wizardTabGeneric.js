
/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OCA = OCA || {};

(function() {

	//var WizardTabGeneric = new OCA.LDAP.Wizard.WizardObject();

	var WizardTabGeneric = OCA.LDAP.Wizard.WizardObject.subClass({
		init: function(tabIndex, tabID) {
			this.tabIndex = tabIndex;
			this.tabID = tabID;
			this.spinner = '<img class="wizSpinner" src="'+ OC.imagePath('core', 'loading.gif') +'">';
			console.log('this was generic');
		},

		setManagedItems: function(managedItems) {
			this.managedItems = managedItems;
			this._enableAutoSave();
		},

		setModel: function(configModel) {
			this.configModel = configModel;
		},

		setElementValue: function(elementID, value) {
			var $element = $(elementID);
			// deal with check box
			if($element.is('input[type=checkbox]')) {
				this._setCheckBox(elementID, value);
				return;
			}

			// deal with text area
			if($element.is('textarea') && $.isArray(value)) {
				value = value.join("\n");
			}
			$element.val(value);
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

		_setCheckBox: function(elementID, value) {
			if(parseInt(value, 10) === 1) {
				$(elementID).attr('checked', 'checked');
			} else {
				$(elementID).removeAttr('checked');
			}
		},

		onTabActivate: function() {
			// TODO: use for initialization
		}

	});

	OCA.LDAP.Wizard.WizardTabGeneric = WizardTabGeneric;
})();

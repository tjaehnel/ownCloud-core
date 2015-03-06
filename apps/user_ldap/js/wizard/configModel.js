/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OCA = OCA || {};

(function() {

	var ConfigModel = function() {};

	ConfigModel.prototype = {
		init: function () {
			this.configuration = {};
			this.subscribers   = {};
			this.detectors     = [];
			this.loadingConfig = false;
		},

		load: function (configID) {
			if(this.loadingConfig) {
				return;
			}
			this.configID = configID;
			var url = OC.generateUrl('apps/user_ldap/ajax/getConfiguration.php');
			var params = OC.buildQueryString({ldap_serverconfig_chooser: configID});
			this.loadingConfig = true;
			var model = this;
			$.post(url, params, function (result) { model._processLoadConfig(model, result) });
		},

		newConfig: function(copyCurrent) {
			var url = OC.generateUrl('apps/user_ldap/ajax/getNewServerConfigPrefix.php');
			var params = {};
			if(copyCurrent === true) {
				params['copyConfig'] = this.configID;
			}
			params = OC.buildQueryString(params);
			var model = this;
			copyCurrent = _.isUndefined(copyCurrent) ? false : copyCurrent;
			$.post(url, params, function (result) { model._processNewConfigPrefix(model, result, copyCurrent) });
		},

		deleteConfig: function(configID) {
			var url = OC.generateUrl('apps/user_ldap/ajax/deleteConfiguration.php');
			var params = OC.buildQueryString({ldap_serverconfig_chooser: configID});
			var model = this;
			$.post(url, params, function (result) { model._processDeleteConfig(model, result, configID) });
		},

		callWizard: function(params, callback, detector) {
			var url = OC.generateUrl('apps/user_ldap/ajax/wizard.php');
			var model = this;
			$.post(url, params, function (result) { callback(model, detector, result) });
		},

		save: function() {

		},

		set: function(key, value) {
			if(_.isUndefined(this.configuration[key])) {
				return false;
			}
			if(this.configuration[key] === value) {
				return false;
			}
			this._broadcast('setRequested', {});
			var url = OC.generateUrl('apps/user_ldap/ajax/wizard.php');
			var objParams = {
				ldap_serverconfig_chooser: this.configID,
				action: 'save',
				cfgkey: key,
				cfgval: value
			};
			var strParams = OC.buildQueryString(objParams);
			var model = this;
			$.post(url, strParams, function(result) { model._processSetResult(model, result, objParams) });
		},

		update: function(key, value) {
			if(this.configuration[key] === value) {
				return false;
			}
			var configPart = {};
			configPart[key] = value;
			this._broadcast('configUpdated', configPart);
		},

		on: function(name, fn, context) {
			if(_.isUndefined(this.subscribers[name])) {
				this.subscribers[name] = [];
			}
			this.subscribers[name].push({fn: fn, context: context});
		},

		registerDetector: function(detector) {
			if(detector instanceof OCA.LDAP.Wizard.WizardDetectorGeneric) {
				this.detectors.push(detector);
			}
		},

		_broadcast: function(name, params) {
			if(_.isUndefined(this.subscribers[name])) {
				return;
			}
			var subscribers = this.subscribers[name];
			var subscriberCount = subscribers.length;
			for(var i = 0; i < subscriberCount; i++) {
				subscribers[i]['fn'](subscribers[i]['context'], params);
			}
		},

		_processLoadConfig: function(model, result) {
			model.configuration = {};
			if(result.status === 'success') {
				$.each(result.configuration, function(configkey, configvalue) {
					model.configuration[configkey] = configvalue;
				});
			}
			console.log(model.configuration); //FIXME: remove debug output once we're good
			model.loadingConfig = false;
			model._broadcast('configLoaded', model.configuration);
		},

		_processSetResult: function(model, result, params) {
			var isSuccess = (result.status === 'success');
			if(isSuccess) {
				model.configuration[params.cfgkey] = params.cfgval;
			}
			var payload = {
				isSuccess: isSuccess,
				key: params.cfgkey,
				value: model.configuration[params.cfgkey],
				errorMessage: _.isUndefined(result.message) ? '' : result.message
			};
			model._broadcast('setCompleted', payload);

			// let detectors run
			// NOTE: detector's changes will not result in new _processSetResult
			// calls, … in case they interfere it is because of this ;)
			var detectorCount = model.detectors.length;
			for(var i = 0; i < detectorCount; i++) {
				if(model.detectors[i].triggersOn(params.cfgkey)) {
					model.detectors[i].run(model, model.configID);
				}
			}
		},

		_processNewConfigPrefix: function(model, result, copyCurrent) {
			var isSuccess = (result.status === 'success');
			var payload = {
				isSuccess: isSuccess,
				configPrefix: result.configPrefix,
				errorMessage: _.isUndefined(result.message) ? '' : result.message
			};
			model._broadcast('newConfiguration', payload);

			if(isSuccess) {
				this.configID = result.configPrefix;
				if(!copyCurrent) {
					model.configuration = {};
					$.each(result.defaults, function(configkey, configvalue) {
						model.configuration[configkey] = configvalue;
					});
					// view / tabs need to update with new blank config
					model._broadcast('configLoaded', model.configuration);
				}
			}
		},

		_processDeleteConfig: function(model, result, configID) {
			var isSuccess = (result.status === 'success');
			var payload = {
				isSuccess: isSuccess,
				configPrefix: configID,
				errorMessage: _.isUndefined(result.message) ? '' : result.message
			};
			model._broadcast('deleteConfiguration', payload);
		}
	};

	OCA.LDAP.Wizard.ConfigModel = ConfigModel;
})();

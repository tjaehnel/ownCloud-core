
/**
 * Copyright (c) 2015, Arthur Schiwon <blizzz@owncloud.com>
 * This file is licensed under the Affero General Public License version 3 or later.
 * See the COPYING-README file.
 */

OCA = OCA || {};

(function() {
	var WizardDetectorQueue = OCA.LDAP.Wizard.WizardObject.subClass({
		init: function() {
			this.queue = [];
			this.isRunning = false;
		},

		reset: function() {
			this.queue = [];
			if(!_.isUndefined(this.runningRequest)) {
				this.runningRequest.abort();
				delete this.runningRequest;
			}
			this.isRunning = false;
		},

		add: function(callback) {
			this.queue.push(callback);
			this.next();
		},

		next: function() {
			if(this.isRunning === true || this.queue.length === 0) {
				return;
			}

			this.isRunning = true;
			var callback = this.queue.shift();
			var request = callback();

			// we receive either false or a jqXHR object
			// false in case the detector decided against executing
			if(request === false) {
				this.isRunning = false;
				this.next();
				return;
			}
			this.runningRequest = request;

			var detectorQueue = this;
			$.when(request).then(function() {
				detectorQueue.isRunning = false;
				detectorQueue.next();
			});
		}
	});

	OCA.LDAP.Wizard.WizardDetectorQueue = WizardDetectorQueue;
})();
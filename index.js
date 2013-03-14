var events = require("events");
var util = require("util");

function jobCallback(job) {
	var that = this;

	return function() {
		job.completedResults = Array.prototype.slice.call(arguments);

		job.elapsed = Date.now() - job.startTime;
		job.complete = true;

		that.complete++;
		that.active--;
		that.timeSpent += job.elapsed;

		that.emit('job-completed', getStats.call(that, job));
		if (that.complete === that.jobs.length) {
			that.emit("complete", getStats.call(that));
		}
	}
}

function runIfAble(job) {
	var that = this;
	if (this.active >= this.maxActive) {
		return setTimeout(function() {
			runIfAble.call(that, job);
		}, this.wait);
	}

	job.startTime = Date.now();
	job.startResult = job.fn(jobCallback.call(this, job));

	that.active++;

	this.emit("job-started", getStats.call(this, job));
}

function getStats(job) {
	var stats = {
		'active' : this.active,
		'pending' : this.jobs.length - this.complete,
		'complete' : this.complete,
		'averageRunTime' : this.timeSpent / this.complete
	};

	if (job) {
		stats.job = job;
	}

	return stats;
}

var Throttler = module.exports = function(options) {
	if (!(this instanceof Throttler)) {
		return new Throttler(options);
	}

	if (!options.maxActive) {
		throw new Error('options.maxActive must be specified');
	}

	this.maxActive = options.maxActive;
	this.wait = options.wait || 1000;

	this.active = 0;
	this.complete = 0;
	this.success = 0;
	this.jobs = [];
	this.timeSpent = 0;
};
util.inherits(Throttler, events.EventEmitter);

Throttler.prototype.add = function(fn, identifier) {
	var job = {
		'identifier' : identifier || "Job #" + (this.jobs.length + 1),
		'fn' : fn
	};

	this.jobs.push(job);
	runIfAble.call(this, job);

	return this;
};
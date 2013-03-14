var Throttler = require('./index');

var throttler = new Throttler({
	'maxActive' : 5,
	'wait' : 2500
});

for (var i = 0; i < 20; i++) {
	throttler.add(function(callback) {
		// do some work
		setTimeout(function() {
			callback('some', 'results');
		}, Math.random() * (3000 - 500) + 500);
	});
}

throttler.on('job-started', function(stats) {
	console.log('Job started. Current stats: %j', stats);
}).on('job-completed', function(stats) {
	console.log('Job completed. Current stats: %j', stats);
}).on('complete', function(stats) {
	console.log('All jobs complete. Final stats: %j', stats);
});
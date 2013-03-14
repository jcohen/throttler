# Throttler!

A little event-based util to make it easier to throttle execution for a batch of jobs.

## Installation

```
npm install throttler
```

## Usage

```javascript
var Throttler = require('throttler');

var throttler = new Throttler({
	'maxActive' : 50,
	'wait' : 2500
});

for (var i = 0; i < 1000; i++) {
	throttler.add(function(callback) {
		// do some work
		callback(some, results);
	});
}

throttler.on('job-started', function(stats) {
	console.log('Job started. Current stats: %j', stats);
}).on('job-completed', function(stats) {
	console.log('Job completed. Current stats: %j', stats);
}).on('complete', function(stats) {
	console.log('All jobs complete. Final stats: %j', stats);
});
````

## Details

When creating a new Throttler instance you can specify two options:

```javascript
{
	'maxActive' : 50,	// The maximum number of jobs to run at once. Must be specified
	'wait' : 2500 		// The time, in milliseconds, to wait before trying to run more jobs if maxActive jobs are currently running
}
```

You then add jobs to the Throttler instance. Each job is simply a function that takes a single parameter: a callback to be invoked when their work is complete. As each job finishes doing its work, it should invoke this callback with any relevant arguments to notify the Throttler instance. As the Throttler works, it will fire off a variety of events that allow you to keep track of its progress, any arguments passed to the callback will be available via these events.

## Events

<table>
    <tr>
        <td>job-started</td>
		<td>Emitted whenever a new job is started</td>
    </tr>
    <tr>
        <td>job-completed</td>
		<td>Emitted whenever a job completes</td>
    </tr>
    <tr>
        <td>complete</td>
		<td>Emitted when all jobs are complete</td>
    </tr>
</table>

Each event will be emitted with a stats object that gives you the current status of all jobs. For the two job-specific events (job-started and job-completed) the stats object will also have a reference to the job, including any arguments passed to the callback when the job completed.

### job-started
```javascript
{
	"active" : 2,					// The number of actively running jobs
	"pending" : 16,					// The number of pending jobs
	"complete" : 4,					// The number of completed jobs
	"averageRunTime" : 1756.5,		// The current average for how long each job takes to complete, in milliseconds
	"job" : {
		"identifier" : "Job #6",	// A system-generated job identifer
		"startTime" : 1363294870424	// The time the job was started
	}
}
```

### job-completed

For the job-completed event, the stats object has all of the above properties, but the jobs property will contain additional properties

```javascript
{
	"active" : 4,
	"pending" : 15,
	"complete" : 5,
	"averageRunTime" : 2002,
	"job" : {
		"identifier" : "Job #4",
		"startTime" : 1363294867922,
		"completedResults" : ["some","results"],	// The args passed to the callback when the job completed
		"elapsed" : 2984,							// The elapsed time to run the job, in milliseconds
		"complete" : true							// Did the job complete, will always be true here
	}
}
```

### completed

For the final completed event, you'll simply get the non-job specific stats:

```javascript
{
	"active" : 0,
	"pending" : 0,
	"complete" : 20,
	"averageRunTime" : 1678.9
}
```
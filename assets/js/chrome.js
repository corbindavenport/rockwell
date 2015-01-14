chrome.app.runtime.onLaunched.addListener(function() {
	chrome.app.window.create('index.html', {
		'minWidth': 800,
		'minHeight': 500
	});
});
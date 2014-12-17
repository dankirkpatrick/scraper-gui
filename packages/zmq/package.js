Npm.depends({
	'zmq': '2.8.0'
});

Package.on_use(function (api) {
	api.add_files('zmq.js', 'server');
});


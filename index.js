// through is a thin wrapper around node transform streams
var through = require("through"),
	path = require("path"),
	gutil = require("gulp-util"),
	PluginError = gutil.PluginError,
	File = gutil.File,
	vm = require("vm"),
	contextForRunInContext = vm.createContext({
		require: null,
		module: null,
		console: null,
		window: null,
		document: null
	}),
	PLUGIN_NAME = "gulp-yui-meta";

module.exports = function(fileName, opts) {
	if (!fileName) {
		throw new PluginError(PLUGIN_NAME,  "Missing fileName option for " + PLUGIN_NAME);
	}

	if (!opts) {
		opts = {};
	}

	var modules = {},
		firstFile = null;

	function stringify(obj) {
		var placeholder = "____PLACEHOLDER____",
			fns = [],
			json = JSON.stringify(obj, function(key, value) {
				if (typeof value === "function") {
					fns.push(value);
					return placeholder;
				}
				return value;
			}, 4);

		json = json.replace(new RegExp('"' + placeholder + '"', "g"), function() {
			return fns.shift();
		});
		return json;
	}

	function getModuleConfig(fContents, fName) {
		var mod;

		contextForRunInContext.YUI = {
			add: function (name, fn, version, config) {
				mod = config || {};
				mod.name = mod.name || name;
			}
		};

		try {
			vm.runInContext(fContents, contextForRunInContext, fName);
		} catch (e) {
			return;
		}

		return mod;
	}

	function bufferContents(file) {
		if (file.isNull()) {
			// ignore
			return;
		}

		if (file.isStream()) {
			return this.emit("error", new PluginError(PLUGIN_NAME,  "Streaming not supported"));
		}

		if (!firstFile) {
			firstFile = file;
		}

		var ext = path.extname(file.path),
			name = path.basename(file.path, ext).replace(/-min$|-debug$/, ""),
			type = ext.substr(1),
			module = {};

		if (type === "js") {
			module = getModuleConfig(file.contents.toString("utf8"), file.path) || {};

			if (!module) {
				return;
			}
		}

		module.name = module.name || name;
		module.path = name + "/" + name + "-min." + type;
		module.type = type;

		if (module) {
			modules[name] = module;
		}
	}

	function endStream() {
		if (modules.length === 0) {
			return this.emit("end");
		}

		var metaPath = path.join(firstFile.base, fileName),
			metaContents = stringify(modules),
			metaFile;
		
		metaFile = new File({
			cwd: firstFile.cwd,
			base: firstFile.base,
			path: metaPath,
			contents: new Buffer(metaContents)
		});

		this.emit("data", metaFile);
		this.emit("end");
	}

	return through(bufferContents, endStream);
};

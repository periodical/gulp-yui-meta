## Information

<table>
    <tr>
        <td>Package</td>
        <td>gulp-yui-meta</td>
    </tr>
    <tr>
        <td>Description</td>
        <td>Extract and concat YUI Loader meta data from YUI Modules</td>
    </tr>
    <tr>
        <td>Node Version</td>
        <td>≥ 0.10</td>
    </tr>
</table>

## Basic Usage

Extract meta from build YUI modules and concat to string representation of a
JavaScript object.

```javascript
var yuiMeta = require("gulp-yui-meta");

gulp.task("templates", function () {
  return gulp.src("./lib/build/*/*-min.js")
    .pipe(yuiMeta("meta.js"))
    .pipe(gulp.dest("./lib/build/meta"));
});
```

## Supported meta data

The supported parameters for the YUI module configuration can be found in the 
[YUI Documentation](http://yuilibrary.com/yui/docs/api/classes/Loader.html#method_addModule).

**Note**
This plugin accounts for `function`s inside the module configuration and keeps
them executable in the outputted JavaScript Object. If you want to save the meta
data as a `.json` file you have to parse them out before.

## Example

The following example of a `gulp` task assumes you have your build modules in
subfolders by module name in a `./public/build` folder:

```javascript
var yuiMeta = require("gulp-yui-meta"),
    wrap = require("gulp-wrap"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify");

gulp.task("meta", function () {
    return gulp.src(["public/build/*/*.js", "public/build/*/*.css"])
        // Concat the YUI module meta
        .pipe(yuiMeta("meta.js"))
        // Wrap the plain JavaScript hash inside a template to be able to
        // include it as a script in the browser later on. You may change the
        // template if you want to use the meta data as an AMD or RequireJS
        // module instead.
        .pipe(wrap("YUI.namespace(\"Env\").modules = <%= contents %>;\n"))
        // Write the file to disk
        .pipe(gulp.dest("public/build/meta"))
        // Rename the file from `meta.js` to `meta-min.js`
        .pipe(rename({suffix: "-min"}))
        // Minify the meta file
        .pipe(uglify())
        // Write the minified file to disk
        .pipe(gulp.dest("public/build/meta"));
});
```

This task generates a `meta` folder inside your `public/build` folder, which
will contain a raw (`meta.js`) and a minified (`meta-min.js`) version of your
YUI module meta.

Now you can use the meta file in your HTML like this:

```html
<html>
<head>
    ...
</head>
<body>
    ...
    <script src="http://yui.yahooapis.com/3.17.1/build/yui/yui-min.js"></script>
    <script src="/build/meta/meta-min.js"></script>
    <script>
        (function (window) {
            window.YUI_config || (window.YUI_config = {});
            window.YUI_config.groups || (window.YUI_config.groups = {});
            window.YUI_config.groups.myGroup = {
                filter: "min",
                base: "build/",
                comboBase: "combo?",
                root: "build/",
                modules: YUI.namespace("Env").modules
            };
        }(this));

        YUI().use("my-custom-module", function (Y) {
            "use strict";
            var myClass = new Y.MyCustomClass();
        });
    </script>
</body>
</html>
```

## LICENSE

MIT License

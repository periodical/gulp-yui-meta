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

## Usage

Extract meta from build YUI modules and concat to string representation of a JavaScript object.

```javascript
var yuiMeta = require("gulp-yui-meta");

gulp.task("templates", function () {
  return gulp.src("./lib/build/*/*-min.js")
    .pipe(yuiMeta("meta.js"))
    .pipe(gulp.dest("./lib/build/meta"));
});
```

## LICENSE

MIT License

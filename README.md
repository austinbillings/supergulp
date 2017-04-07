# supergulp
Deconstruct your monolithic gulpfile!

## Installation
```bash
npm install supergulp --save
```

### Quick Taste
Have you ever had a gulpfile that is way too overstuffed with tasks, logic, and configuration? Enter *Supergulp*, the tool that takes Gulp through a new paradigm. The idea is to break your gulp task logic into distinct javascript files each with only the dependencies they need, and without worrying about input or output configuration. You provide a configuration file path, and supergulp injects the configuration into each task it finds in the '/gulp' directory. Suddenly, all your gulp tasks and pipelines are more portable, easier to understand and debug, and less reliant on baked-in configuration. **Let's get cookin'.**

```js
/* file: gulpfile.js */
const supergulp = require('supergulp');
supergulp();

// or, with options (the defaults are shown)
supergulp({
  tasks: './gulp/',
  config: './gulp.config.js'
});
```
*Crazy, right? That's all your gulpfile needs to contain.*

With the above as your `gulpfile.js`, imagine the following is your `gulp.config.js`:

```js
/* file: gulp.config.js */
module.exports = {
  output: {
    dir: 'dist',
    filenames: {
      app: 'app.js',
      sass: 'ui.css'
    }
  },
  sources: {
    app: './app/src',
    sass: './ui/scss'
  },
  productionMode: true
}
```

In our imaginary project here, we also have a **/gulp** directory, which contains the files `build-app.js` and `compile-sass.js`. Each of these contains a single gulp task, setup to take our configuration from the above file and perform tasks.

```js
/* file: build-app.js */
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

module.exports = (gulp, config, hook) => {
  gulp.task('build-app', () => {
    gulp.src(config.sources.app)
      .pipe(concat(config.output.filenames.app))
      .pipe(gulp.dest(config.output.dir));
  }
  // now we can run "gulp build-app" as expected.
  // Also, let's hook this task into our "default" task set as well,
  // including a source file watcher that will recompile on save. 
  // The second argument specifies the watcher glob.
  hook('build-app', config.sources.app);
}
```

Another example:

```js
/* file: compile-sass.js */
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglifycss');

module.exports = (gulp, config, hook) => {
  gulp.task('compile-sass', () => {
    gulp.src(config.sources.sass)
      .pipe(config.output.filenames.sass)
      .pipe(sass().on('error', sass.logError))
      .pipe(uglify())
      .pipe(gulp.dest(config.output.dir));
  });
  // This time, let's hook the 'compile-sass' task into BOTH
  // the 'default' set AND a new 'styles' task set.
  hook('compile-sass', config.sources.sass, ['default', 'styles']);
  // Let's also hook this task into a new set, 'build', without running a watcher
  // on the source files. This way, when running 'gulp build', the files will be built
  // and the task will complete immediately, and not run indefinitely.
  hook('compile-sass', null, 'build');
}
```

Following these examples, we are able to run `gulp`, and both the 'compile-sass' and 'build-app' tasks run. Additionally, a watcher is setup on their source files and they are recompiled to our output directory when saved. We can also run 'gulp styles', which will build our sass files, and watch the sources. If we run 'gulp build', our sass files are compiled but the sources are not watched. 

## Getting started

First, your gulp tasks should be kept as separate javascript files in a directory of your choosing. By default, supergulp uses the `./gulp` directory based on wherever your gulpfile is. Each file containing a gulp task should use `module.exports` to export a function that takes the following arguments:
- `gulp`, (required) the same instance of gulp that is passed to all the task files (Be sure **not** to `require('gulp')`)
- `config`, (optional, but recommended) a global configuration object of your design, which is exported by your config file (default: './gulp.config.js')
- `hook`, (optional) a function which allows you to "hook" tasks into "task sets", for instance into your "default" gulp task. `hook` itself is a function that takes three arguments:
  - `taskName`, a string or array of strings indicating the already-declared task to be "hooked",
  - `watch`, a glob pattern to "watch" and re-fire the given tasks when files are changed (default: `null`)
  - `set`, the name of the parent task/set of tasks to hook into. (default: `'default'`) Note that "sets" of tasks should not be explicitly declared with `gulp.task`, but are generated automatically by supergulp.

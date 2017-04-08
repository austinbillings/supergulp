# Supergulp
Deconstruct your monolithic gulpfile!

### Introduction
Have you ever ended up with a **gulpfile.js** way too overstuffed with tasks, logic, and configuration?

Enter *Supergulp*, the tool that takes Gulp through a new paradigm. Break your gulp task logic into distinct javascript files each self-contained and lightweight, and without worrying about your configuration being ripped across 20 different scripts. You provide one configuration file, and Supergulp injects the configuration into each task it finds in the '/gulp' directory. Suddenly, all your gulp tasks and pipelines are more portable, easier to understand and debug, and less reliant on baked-in configuration. **Let's get cookin'.**

---

### Installation
```bash
npm install supergulp --save
```

## Crash Course: Anatomy of a Supergulp task

Your `gulpfile.js` (more about this below):
```js
require('supergulp')();
```
Now, each of your gulp tasks has its own `.js` file within `/gulp`. Here's what each basically looks like:

```js
module.exports = (gulp, config, hook) {  
  // Register your gulp tasks as usual, using the gulp injected to this function
  gulp.task('myTask', () => {
    // whatever you export from 'gulp.config.js' is accessible everywhere!
    // *  This is ES6-style deconstruction notation, by the way.
    //    Don't be scared, it's super useful.
    let { output, sources } = config;
    return gulp.src(sources.app)
      .pipe(concat(output.appFilename))
      .pipe(gulp.dest(output.dir));
  });
```
Classic "task sets" (compound tasks) are still fully supported:
```js
module.exports = (gulp, config, hook) {
  gulp.task('myTask', () => {
    ...
  });
  
  gulp.task('export', ['myTask', 'myOtherTask', 'thirdTask']);
}
```
...but they're discouraged, because reasons.
- The other task definitions would need to live in the same file, or...
- We must rely on the other tasks *always* being present. That's no fun.

For these reasons, the hook system came about.

#### The `hook()` system
1. Use `hook()` to specify which compound gulp task or "task sets" a task (or set of tasks) should belong to.
  
    Optionally, pass a glob string to "watch" for changes, enabling automatic re-execution.
    
2. All hooks are collected together to form compound tasks.
    
    This helps to avoid compound task definitions needing to reference a task in a separate file, and they can be moved from project-to-project without fear.
    
    For this reason, compound tasks should be considered *abstract*, so **do not attempt to hook into a task which is already defined**. A warning will be given and the hook will not be established.

```js
/*      In my-task.js      */
module.exports = (gulp, config, hook) {
  gulp.task('myTask', () => { 
    ...
  });
  
  hook('myTask', null, 'export');
}

/*   ...in other-task.js      */

module.exports = (gulp, config, hook) {
  gulp.task('otherTask', () => {
    ...
  });
  
  hook('otherTask', null, 'export');
}
```

The above is the equivalent of...
```js
gulp.task('export', ['myTask', 'otherTask'])
```
...but decentralized and without any assumptions that both tasks exist.

## Anatomy of a Supergulp file
```js
module.exports = (gulp, config, hook) {
  gulp.task('whatever', () => {
    ... 
  });
}
```

Your tasks should be kept as separate javascript files in a directory of your choosing. By default, Supergulp checks the `./gulp` directory relative to your gulpfile.

Every file in the directory should use `module.exports` to export a function that takes the following arguments, and within which you can define one or a million gulp tasks.

|Parameter|Description|Tips|
|:---|:---|:---
|`gulp`|The gulp instance shared by all defined Supergulp tasks.|Be sure **not** to `require('gulp')`. Use this instead.|
|`config`|Optional, but useful: a global configuration object of your design, which is exported by your config file (default: `./gulp.config.js`).|Use a consistent config structure between projects for maximum task portability.|
|`hook`|A function which allows you to "hook" tasks into "task sets", for instance into your "default" gulp task.| |


`hook` itself is used a function that takes three arguments:

|Parameter|Description|Tips|
|:---|:---|:---
|`taskName`|A string or array of strings indicating the task(s) to be "hooked".|
|`watch`|A glob pattern to "watch" and re-fire the given tasks when files are changed. Defaults to `null`, in which case no watchers are set up.|It's easiest to provide the same glob you'd use in `gulp.src()` if you want to watch for changes.
|`set`|The name of a compound task (a string) or tasks (an array) to "hook" into. Defaults to the 'default' task. | Compound tasks should not be explicitly declared with `gulp.task`, but are generated automatically by Supergulp.

## Sample App Setup

Here's the file structure of our imaginary demonstration app:
```
├── dist
├── gulp
│   ├── build-app.js
│   └── compile-sass.js
├── node_modules
│   └── [...]
├── gulp.config.js
├── gulpfile.js
└── package.json
```

Let's start with **gulpfile.js**.

```js
/* file: gulpfile.js */
const supergulp = require('supergulp');
supergulp();
```

With custom settings (the defaults are shown):
```js
/* file: gulpfile.js */
const supergulp = require('supergulp');

let tasks = './gulp/';
let config = './gulp.config.js';

supergulp({ tasks, config });
```

Super minimal:
```js
/* file: gulpfile.js */
require('supergulp')();
```
*Crazy, right?*

With the above as your `gulpfile.js`, the following might be `gulp.config.js`:

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
/* file: /gulp/build-app.js */
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

module.exports = (gulp, config, hook) => {
  gulp.task('build-app', () => {
    gulp.src(config.sources.app)
      .pipe(concat(config.output.filenames.app))
      .pipe(gulp.dest(config.output.dir));
  }
```

Now we can run "gulp build-app" and our app files will get concatenated and put in `/dist` as expected. Let's hook this task into our "default" task set as well, including a source file watcher that will recompile on save. The second argument specifies the watcher glob.

```js
  hook('build-app', config.sources.app);
}
```

Another example:

```js
/* file: /gulp/compile-sass.js */
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
```
  This time, let's hook the 'compile-sass' task into BOTH the 'default' set AND a new 'styles' task set.
```js
  hook('compile-sass', config.sources.sass, ['default', 'styles']);
```
  Let's also hook this task into a new set, 'build', without running a watcher on the source files. This way, when running 'gulp build', the files will be built and the task will complete immediately, and not run indefinitely.
```js
  hook('compile-sass', null, 'build');
}
```

Following these examples, we are able to run `gulp`, and both the 'compile-sass' and 'build-app' tasks run. Additionally, a watcher is setup on their source files and they are recompiled to our output directory when saved. We can also run 'gulp styles', which will build our sass files, and watch the sources. If we run 'gulp build', our sass files are compiled but the sources are not watched. 

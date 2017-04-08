const zaq = require('zaq');
const gulp = require('gulp');
const path = require('path');
const chalk = require('chalk');
const _ = require('underscore');
const callsite = require('callsite');
const colleqtor = require('colleqtor');

const registry = [];
const hook = (taskName, watch, set = 'default') => registry.push({ taskName, watch, set });

module.exports = (_settings = {}) => {
  let __root = path.dirname(callsite()[1].getFileName());
  
  const Defaults = {
    tasks: path.join(__root, '/gulp/'),
    config: path.join(__root, '/gulp.config.js')
  };
  
  let settings = _.defaults(_settings, Defaults);
  let tasks = colleqtor.require(settings.tasks);
  
  let shorten = (x) => _.map(x, (y) => path.relative(__root, y));
  
  var config;
  try {
    config = require(settings.config);
  } catch(e) {
    zaq.err(`Supergulp err: couldn't read config file at: ${chalk.italic(settings.config)}`);
    config = {};
  }
  
  for (let taskName in tasks) {
    tasks[taskName](gulp, config, hook);
  }

  let setNames = _.uniq(_.flatten(_.pluck(registry, 'set')));

  setNames.forEach(setName => {
    let tasks = _.filter(registry, item => item.set === setName || _.contains(item.set, setName));
    let taskList = _.uniq(_.flatten(_.pluck(tasks, 'taskName')));
    let watchables = _.filter(tasks, task => task.watch);
    
    if (gulp.task(setName)) return zaq.warn(`Attempted to create compound task from existing task: ${chalk.yellow(setName)}`)
    
    gulp.task(setName, taskList, () => {
      watchables.forEach(watchable => {
        zaq.info(`${chalk.cyan(watchable.taskName)} is watching ${chalk.dim(shorten(watchable.watch))}. . .`);
        gulp.watch(watchable.watch, _.isArray(watchable.taskName) ? watchable.taskName : [ watchable.taskName ]);
      })
    })
  });
}
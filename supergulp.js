const zaq = require('zaq');
const gulp = require('gulp');
const path = require('path');
const chalk = require('chalk');
const _ = require('underscore');
const colleqtor = require('colleqtor');

const shorten = (x) => _.map(x, (y) => path.relative(__dirname + '/..', y));
const registry = [];
const Hook = (taskName, watch, set = 'default') => registry.push({ taskName, watch, set });

const Defaults = {
  tasks: __dirname + '/gulp',
  config: './gulp.config.js'
};

module.exports = (_settings = {}) => {
  let settings = _.defaults(_settings, Defaults);
  let tasks = colleqtor.require(settings.tasks);
  let config;
  try {
    config = require(settings.config);
  } catch(e) {
    zaq.err(`Supergulp err: couldn't read config file at: ${chalk.italic(settings.config)}`);
    config = {};
  }
  
  for (let taskName in tasks) { tasks[taskName](gulp, config, Hook); }

  let setNames = _.uniq(_.flatten(_.pluck(registry, 'set')));

  setNames.forEach(setName => {
    let tasks = _.filter(registry, item => item.set === setName || _.contains(item.set, setName));
    let taskList = _.uniq(_.flatten(_.pluck(tasks, 'taskName')));
    let watchables = _.filter(tasks, task => task.watch);
    
    gulp.task(setName, taskList, () => {
      watchables.forEach(watchable => {
        zaq.info(`${chalk.cyan(watchable.taskName)} is watching ${chalk.dim(shorten(watchable.watch))}. . .`);
        gulp.watch(watchable.watch, _.isArray(watchable.taskName) ? watchable.taskName : [ watchable.taskName ]);
      })
    })
  });
}
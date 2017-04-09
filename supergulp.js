const zaq = require('zaq');
const gulp = require('gulp');
const path = require('path');
const chalk = require('chalk');
const _ = require('underscore');
const callsite = require('callsite');
const colleqtor = require('colleqtor');

/*
class Sg {
  constructor (options) {
    this.root = path.dirname(callsite()[1].getFileName());
    this.settings = this.getSettings(options);
    
  }
  
  getSettings (optios) {
    return _.defaults(options, this.defaults());
  }
  
  get registry () { return this._registry; }
  set registry (registry) {
    this._registry = registry;
  }
  
  defaults () {
    return {
      tasks: path.join(this.root, '/gulp/'),
      config: path.join(this.root, '/gulp.config.js')
    }
  }
}
*/

const Supergulp = function (options = {}) {
  let root = path.dirname(callsite()[1].getFileName());
  
  let defaults = {
    tasks: path.join(this.root, '/gulp/'),
    config: path.join(this.root, '/gulp.config.js')
  };
  
  let settings = _.defaults(options, defaults);
  
  let taskFiles = colleqtor.require(settings.tasks);
  
  let hook = (task, watch, set = 'default') => {
    return registry.push({ task, watch, set });
  };
  
  let shorten = (x) => {
    return _.map(x, (y) => path.relative(root, y));
  };
  
  let config = {};
  try { config = require(settings.config); } 
  catch (e) { return zaq.err(`Couldn't read Supergulp config @${chalk.italic(settings.config)}`); }
  
  config.ensure = (prop) => {
    if (!jawn.hath(config, prop)) {
      zaq.warn(`Missing config value: ${chalk.dim.yellow(prop)} in ${chalk.dim.yellow(settings.configs)}`);
      return false;
    }
    return true;
  }
  
  for (let taskName in taskFiles) {
    taskFiles[taskName](gulp, config, hook, root);
  }

  let compounds = _.uniq(_.flatten(_.pluck(registry, 'set')));
  _.each(compounds, setName => {
    let subTasks = _.filter(registry, item => item.set === setName || _.contains(item.set, setName));
    let subTaskList = _.uniq(_.flatten(_.pluck(subTasks, 'taskName')));
    let watchables = _.filter(subTasks, task => task.watch);
    
    if (gulp.task(setName)) {
      return zaq.warn(`Attempted to create compound task from existing task: ${chalk.yellow(setName)}`);
    };
    
    gulp.task(setName, subTaskList, () => {
      watchables.forEach(watchable => {
        zaq.info(`${chalk.cyan(watchable.taskName)} is watching ${chalk.dim(shorten(watchable.watch))}. . .`);
        gulp.watch(watchable.watch, watchable.taskName);
      })
    });
    
  });
}

module.exports = Supergulp;
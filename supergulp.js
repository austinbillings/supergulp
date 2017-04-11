const zaq = require('zaq');
const gulp = require('gulp');
const path = require('path');
const chalk = require('chalk');
const _ = require('underscore');
const jawn = require('node-jawn');
const callsite = require('callsite');
const colleqtor = require('colleqtor');

const Defaults = (root) => {
  return {
    verbose: true,
    tasks: path.join(root, '/gulp/'),
    config: path.join(root, '/gulp.config.js')
  }
};

class Supergulp {
  constructor (settings = {}) {
    let rootFile = callsite()[0].getFileName();
    
    this.root = path.dirname(rootFile);
    this.settings = _.defaults(settings, Defaults(this.root));
    this.registry = [];
    
    this.loadTasks();
    this.setConfig();
    this.activateTasks();
    this.compoundTasks();
  }
  
  setConfig () {
    this.config = {};
    try { this.config = require(this.settings.config); } 
    catch (e) {
      let location = path.relative(root, this.settings.config);
      let where = chalk.red.italic(location);
      zaq.err(`Supergulp: couldn't import config file ${where}`)
    }
    this.config.lacks = this.lacks();
    return this.config;
  }
  
  loadTasks () {
    if (!this.settings.tasks) return zaq.err(`Supergulp: No task directory specified.`);
    try { return this.taskFiles = colleqtor.require(this.settings.tasks); }
    catch (err) { 
      zaq.err(`Supergulp: couldn't load all task files in ${this.settings.tasks}`, err);
      return err;
    }
  }
  
  compoundTasks () {
    let homogenize = (list) => _.filter(_.uniq(_.flatten(list)), item => item); 
    let { cyan, dim } = chalk;
    let compounds = homogenize(_.pluck(this.registry, 'set'));
    
    _.each(compounds, compoundTask => {
      let subTasks = _.filter(this.registry, item => (item.set === compoundTask || _.contains(item.set, compoundTask)));
      let subTaskList = homogenize(_.pluck(subTasks, 'taskName'));
      let watchables = _.filter(subTasks, task => task.watch);
      zaq.info(`Creating new compound task: ${chalk.blue(compoundTask)}`);
      
      gulp.task(compoundTask, subTaskList, () => {
        watchables.forEach(watchable => {
          let taskName = cyan(watchable.taskName);
          let glob = dim(shorten(watchable.watch));
          if (settings.verbose) zaq.info(`${taskName} is watching ${glob}. . .`);
          gulp.watch(watchable.watch, watchable.taskName);
        })
      });
      
    });
  }
  
  activateTasks () {
    let { config, root } = this;
    let hook = (task, set = 'default', watch) => {
      this.registry.push({ task, watch, set });
    };
    for (let taskName in this.taskFiles) {
      this.taskFiles[taskName](gulp, config, hook, root);
    }
  }
  
  shortenPaths (pathSet) {
    return _.map(pathSet, path => path.relative(this.root, path));
  }
  
  parseList (list) {
    return !_.isString(list) ? (list ? list : []) : list.split(',').map(x => x.trim()).filter(x => x.length);
  }
  
  lacks () {
    let sg = this;
    return function (_keys, _requiringTasks) {
      let missing = [];
      let keys = sg.parseList(_keys);
      let requiringTasks = sg.parseList(_requiringTasks);
      let { dim, yellow, magenta} = chalk;
      let configPath = './' + path.relative(sg.root, sg.settings.config);
      
      _.each(keys, key => {
        if (!jawn.hath(sg.config, key)) missing.push(key);
      });
      
      var message;
      let plural = requiringTasks.length > 1;
      let pluralKeys = missing.length > 1;
      if (requiringTasks.length) {
        message = magenta(requiringTasks.join(', '));
        message += dim(` ${plural ?  'are' : 'is'} missing config value${pluralKeys ? 's' : ''}: `)
      } else {
        message = dim(`missing config value${pluralKeys ? 's' : ''}: `);
      }
      
      message += yellow(missing.join(', '));
      zaq.warn(message);
      
      return missing.length;
    }
  }
}

module.exports = function (options) {
  return new Supergulp(options);
};
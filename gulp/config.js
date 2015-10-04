'use strict';

module.exports = {

  'serverPort': 3001,
  'browserPort': 3002,
  'UIPort': 3003,

  'scripts': {
    'src': './app/js/**/*.js',
    'dest': './build/js/'
  },

  'images': {
    'src': './app/images/**/*.{jpeg,jpg,png}',
    'dest': './build/images/'
  },

  'styles': {
    'src': './app/styles/**/*.scss',
    'dest': './build/css/'
  },

  'fonts': {
    'src': ['./app/fonts/**/*'],
    'dest': './build/fonts'
  },

  'sourceDir': './app/',
  'buildDir': './build/',

  'tests': './__tests__/**/*.{js,jsx}',

  'api': {
    'prod': 'http://api.monolist.co/v1/'
  }

};
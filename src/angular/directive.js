'use strict';

/* global angular */

// setup DOM element
var DOM = require('../common/dom.js');
DOM.element = angular.element;

// setup utils functions
var _ = require('../common/utils.js');
_.isArray = angular.isArray;
_.isFunction = angular.isFunction;
_.isObject = angular.isObject;
_.bind = angular.element.proxy;
_.each = angular.forEach;
_.map = angular.element.map;
_.mixin = angular.extend;

////////////////////////

var EventBus = require('../autocomplete/event_bus.js');
var Typeahead = require('../autocomplete/typeahead.js');

angular.module('algolia.autocomplete', [])
  .directive('autocomplete', ['$parse', function($parse) {
    return {
      restrict: 'AC', // Only apply on an attribute or class
      scope: {
        options: '&aaOptions',
        datasets: '&aaDatasets'
      },
      link: function(scope, element, attrs) {
        attrs = attrs; // no-unused-vars
        scope.options = $parse(scope.options)(scope);
        if (!scope.options) {
          scope.options = {};
        }
        scope.datasets = $parse(scope.datasets)(scope);
        if (scope.datasets && !angular.isArray(scope.datasets)) {
          scope.datasets = [scope.datasets];
        }

        var eventBus = new EventBus({el: element});
        var autocomplete = null;

        // reinitialization watchers
        scope.$watch('options', initialize);
        if (angular.isArray(scope.datasets)) {
          scope.$watchCollection('datasets', initialize);
        } else {
          scope.$watch('datasets', initialize);
        }

        // init function
        function initialize() {
          if (autocomplete) {
            autocomplete.destroy();
          }
          autocomplete = new Typeahead({
            input: element,
            eventBus: eventBus,
            hint: scope.options.hint,
            minLength: scope.options.minLength,
            autoselect: scope.options.autoselect,
            openOnFocus: scope.options.openOnFocus,
            templates: scope.options.templates,
            debug: scope.options.debug,
            datasets: scope.datasets
          });
        }

        // Propagate the selected event
        element.bind('autocomplete:selected', function(object, suggestion, dataset) {
          scope.$emit('autocomplete:selected', suggestion, dataset);
        });

        // Propagate the autocompleted event
        element.bind('autocomplete:autocompleted', function(object, suggestion, dataset) {
          scope.$emit('autocomplete:autocompleted', suggestion, dataset);
        });

        // Propagate the opened event
        element.bind('autocomplete:opened', function() {
          scope.$emit('autocomplete:opened');
        });

        // Propagate the closed event
        element.bind('autocomplete:closed', function() {
          scope.$emit('autocomplete:closed');
        });

        // Propagate the cursorchanged event
        element.bind('autocomplete:cursorchanged', function(event, suggestion, dataset) {
          scope.$emit('autocomplete:cursorchanged', event, suggestion, dataset);
        });
      }
    };
  }]);

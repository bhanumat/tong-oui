;(function() {

  'use strict';

  /**
   * <main-footer><main-footer/>
   */
   
  angular
    .module('cignaApp')
    .directive('mainFooter', tinMainFooter);

  function tinMainFooter() {

    // Definition of directive
    var directiveDefinitionObject = {
      restrict: 'E',
      templateUrl: 'components/directives/main-footer.html',
      link: function($scope, elem) {

      }
    };

    return directiveDefinitionObject;
  }

})();
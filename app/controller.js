/**
 * Main application controller
 *
 * You can use this controller for your whole app if it is small
 * or you can have separate controllers for each logical section
 * 
 */
;(function() {

  angular
    .module('boilerplate')
    .controller('MainController', MainController);

  MainController.$inject = ['LocalStorage', 'QueryService', '$scope','$http', '$parse'];


  function MainController(LocalStorage, QueryService, $scope, $http, $parse) {

    // 'controller as' syntax
    var self = this;

    $scope.username = "test";
    $scope.result = "Ha Ha Ha";

    ////////////  function definitions

    $scope.usernameChange = function() {
      $scope.result = $scope.username + "Ha Ha Ha";
    };


    /**
     * Load some data
     * @return {Object} Returned object
     */
    // QueryService.query('GET', 'posts', {}, {})
    //   .then(function(ovocie) {
    //     self.ovocie = ovocie.data;
    //   });
  }


})();
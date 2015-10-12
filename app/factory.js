;(function() {


  /**
   * API factory
   */
  angular
    .module('cignaApp')
    .factory('dataFactory', dataFactory);

  dataFactory.$inject = ['$http', 'LocalStorage'];

  function dataFactory($http, LocalStorage) {
    return dataFactory;
    dataFactory = {};
    // datafactory.init = function() {
    //     return $http({
    //       method: 'GET',
    //       // url: API.url + 'loadInitialInfo'
    //       // url: '/initialInfo.jso'
    //       url: '/NewTravel.json'
    //     })
    //   };
    return datafactory;
  }
})();

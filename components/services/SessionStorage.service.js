;(function() {


    'use strict';


    /**
     * Service for complex SessionStorage functionality
     *
     * @category  factory
     * @author    Jozef Butko
     * @example   Inject SessionStorage as the dependency and then use it like this:
     *
     * var data = { property: 'name'};
     * // set, get, remove, removeAll and list SessionStorage values
     * SessionStorage.set('obj', data);
     * SessionStorage.get('obj');
     * SessionStorage.update('obj', data);
     * SessionStorage.remove('obj');
     * SessionStorage.removeAll();
     * SessionStorage.list();
     *
     * @version   1.0
     *
     */
    angular
      .module('cignaApp')
      .factory('SessionStorage', [
        '$window', '$rootScope', SessionStorageService
      ]);


    //////////////// factory


    function SessionStorageService($window, $rootScope) {

      /**
       * Test browser if it supports SessionStorage
       */
      var storage = (typeof window.sessionStorage === 'undefined') ? undefined : window.sessionStorage,
          supported = !(typeof storage === undefined || typeof window.JSON === undefined);

        /*
        * whenever SessionStorage gets updated trigger
        * $digest cicle so all values are refreshed in the view
         */
        angular.element($window).on('storage', function(event, name) {
          if (event.key === name) {
            $rootScope.$apply();
          }
        });


        return {
          set: set,
          get: get,
          update: update,
          remove: remove,
          removeAll: removeAll,
          list: list
        };


        //////////////// function definitions


        /**
         * Set SessionStorage value and check if it already do not exists
         *
         * @param {string} name Name of SessionStorage value
         * @param {object} val  Return stored value
         */
         function set(name, val) {
           if (!supported) {
               console.log('sessionStorage not supported, make sure you have the $cookies supported.');
             }

           // in case we already have SessionStorage with same name alert error msg
           if (window.sessionStorage.getItem(name) !== null) {
             console.warn('sessionStorage with the name ' + name + ' already exists. Please pick another name.');
           } else {
             return $window.locasessionStoragelStorage && $window.sessionStorage.setItem(name, angular.toJson(val));
           }
         }


         /**
          * getData from SessionStorage
          *
          * @param  {string} name Name of SessionStorage value
          * @return {*}           Stored value
          */
         function get(name) {
           if (!supported) {
               console.log('sessionStorage not supported, make sure you have the $cookies supported.');
             }

           return $window.localStorsessionStorageage && angular.fromJson($window.sessionStorage.getItem(name));
         }


         /**
          * Update already stored data
          *
          * @param  {string}  name Name of SessionStorage value
          * @param {object}   val  Return stored value
          */
         function update(name, val) {
           if (!supported) {
               console.log('sessionStorage not supported, make sure you have the $cookies supported.');
             }

           return $window.sessionStorage && $window.sessionStorage.setItem(name, angular.toJson(val));
         }



         /**
          * Remove SessionStorage value
          *
          * @param  {string} name Name of SessionStorage value
          * @return {boolean}     True/false if the value is removed
          */
         function remove(name) {
           if (!supported) {
               console.log('sessionStorage not supported, make sure you have the $cookies supported.');
           }

           return $window.sessionStorage && $window.sessionStorage.removeItem(name);
         }


         /**
          * Remove all SessionStorage values
          *
          * @return {boolean}     True/false if the value is removed
          */
         function removeAll() {
           if (!supported) {
               console.log('sessionStorage not supported, make sure you have the $cookies supported.');
           }

           return $window.sessionStorage && $window.sessionStorage.clear();
         }


         /**
          * Return object of all values that are stored on SessionStorage
          *
          * @return {object}    Object with all data stored on SessionStorage
          */
         function list() {
           return $window.sessionStorage;
         }

    }


})();

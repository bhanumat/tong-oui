;(function () {


    'use strict';


    /**
     * Service for push data to Google Tag Manager
     *
     * @category  service
     * @author    Bhanumat Wiwatmaikul
     * @version   1.0
     *
     */
    angular
        .module('cignaApp')
        .service('GoogleTagManager', [
            '$window', '$rootScope', GoogleTagManager
        ]);


    //////////////// factory


    function GoogleTagManager($window, $rootScope) {
        this.push = function(data) {
            try {
                $window.dataLayer.push(data);
            } catch (e) {}
        };
    }

})();

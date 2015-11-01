/**
 *
 * AngularJS Boilerplate
 * @description           Description
 * @author                Jozef Butko // www.jozefbutko.com/resume
 * @url                   www.jozefbutko.com
 * @version               1.1.7
 * @date                  March 2015
 * @license               MIT
 *
 */
;(function () {


    /**
     * Definition of the main app module and its dependencies
     */

    angular
        .module('cignaApp', [
            'ngRoute', 'ngAnimate', 'ui.bootstrap', 'sticky', 'duParallax', 'duScroll', 'nya.bootstrap.select', 'ui.router', 'ngMessages',
            'ngEqualizer', 'ngSanitize', 'ngMask', 'angulartics', 'angulartics.google.tagmanager', 'dialogs.main'
        ])
        .config(config);

    // safe dependency injection
    // this prevents minification issues
    config.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', '$compileProvider', '$analyticsProvider'];
    /**
     * App routing
     *
     * You can leave it here in the config section or take it out
     * into separate file
     *
     */
    function config($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $compileProvider, $analyticsProvider) {

        $locationProvider.html5Mode(false);
        // routes
        $stateProvider
            .state('insurance', {
                url: '/insurance',
                templateUrl: 'views/home.html',
                controller: 'MainController'
            })
            .state('insurance.destination', {
                url: '/destination',
                templateUrl: 'views/destination.html'
            })
            .state('insurance.plan', {
                url: '/plan',
                templateUrl: 'views/plan.html'
            })
            .state('insurance.profile', {
                url: '/profile',
                templateUrl: 'views/profile.html'
            })
            .state('insurance.payment', {
                url: '/payment',
                templateUrl: 'views/payment.html'
            })
            .state('insurance.thankyou', {
                url: '/thankyou',
                templateUrl: 'views/thankyou.html'
            });

        $urlRouterProvider.otherwise('/insurance/destination');

        $httpProvider.interceptors.push('authInterceptor');

    }


    /**
     * You can intercept any request or response inside authInterceptor
     * or handle what should happend on 40x, 50x errors
     *
     */
    angular
        .module('cignaApp')
        .factory('authInterceptor', authInterceptor);

    authInterceptor.$inject = ['$rootScope', '$q', 'SessionStorage', '$location', 'MESSAGES', '$injector'];

    function authInterceptor($rootScope, $q, SessionStorage, $location, MESSAGES, $injector) {

        return {

            // intercept every request
            request: function (config) {
                config.headers = config.headers || {};
                return config;
            },

            // Catch errors
            responseError: function (response) {
                if (response.data && response.data.responseCode) {
                    var modalService = $injector.get('ModalService');
                    modalService.showError({message: MESSAGES[response.data.responseCode]});
                } else if (response.status === 404) {
                    $location.path('/');
                    return $q.reject(response);
                } else {
                    return $q.reject(response);
                }
            }
        };
    }


    /**
     * Run block
     */
    angular
        .module('cignaApp')
        .run(run);

    run.$inject = ['$rootScope', '$location'];

    function run($rootScope, $location) {

        // put here everything that you need to run on page load

    }


})();

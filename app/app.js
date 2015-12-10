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
            'ngEqualizer', 'ngSanitize', 'ngMask', 'angulartics', 'angulartics.google.tagmanager', 'dialogs.main',
            'pascalprecht.translate', 'dialogs.default-translations'
        ])
        .config(routingConfig)
        .config(dialogConfig);

    // safe dependency injection
    // this prevents minification issues
    routingConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', '$compileProvider', '$analyticsProvider'];
    /**
     * App routing
     *
     * You can leave it here in the config section or take it out
     * into separate file
     *
     */
    function routingConfig($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $compileProvider, $analyticsProvider) {

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
     * Dialog configuration
     * dialogConfig
     * Reference from https://github.com/m-e-conroy/angular-dialog-service
     */
    dialogConfig.$inject = ['dialogsProvider', '$translateProvider'];
    function dialogConfig(dialogsProvider, $translateProvider) {
        dialogsProvider.useBackdrop('static');
        dialogsProvider.setSize('md');
        $translateProvider.translations('th', {
            DIALOGS_ERROR: "Error",
            DIALOGS_ERROR_MSG: "ขออภัยค่ะ ขณะนี้ระบบขัดข้อง กรุณาทำรายการใหม่ภายหลัง",
            DIALOGS_CLOSE: "ปิด",
            DIALOGS_CLOSE_TO_CONTINUE: "ทำรายการต่อ",
            DIALOGS_PLEASE_WAIT: "โปรดรอ",
            DIALOGS_PLEASE_WAIT_ELIPS: "โปรดรอ...",
            DIALOGS_PLEASE_WAIT_MSG: "โปรดรอซักครู่.",
            DIALOGS_PERCENT_COMPLETE: "% เรียบร้อย",
            DIALOGS_NOTIFICATION: "Notification",
            DIALOGS_NOTIFICATION_MSG: "แจ้งเพื่อทราบ.",
            DIALOGS_CONFIRMATION: "Confirmation",
            DIALOGS_CONFIRMATION_MSG: "ยืนยัน.",
            DIALOGS_OK: "ตกลง",
            DIALOGS_YES: "ใช่",
            DIALOGS_NO: "ไม่ใช่"
        });

        $translateProvider.preferredLanguage('th');
        $translateProvider.useSanitizeValueStrategy(null);
    }


    /**
     * You can intercept any request or response inside authInterceptor
     * or handle what should happend on 40x, 50x errors
     *
     */
    angular
        .module('cignaApp')
        .factory('authInterceptor', authInterceptor);

    authInterceptor.$inject = ['$rootScope', '$q', '$location', 'MESSAGES', '$injector'];

    function authInterceptor($rootScope, $q, $location, MESSAGES, $injector) {

        return {

            // intercept every request
            request: function (config) {
                config.headers = config.headers || {};
                return config;
            },

            // Catch errors
            responseError: function (response) {
                if( $rootScope.instanceModalDialog) {
                    $rootScope.instanceModalDialog.close();
                }
                var dialogs = $injector.get('dialogs');

                if (response.data && response.data.resultCode) {
                    var msg = MESSAGES[response.data.resultCode];
                    if( msg) {
                        $rootScope.instanceModalDialog = dialogs.error('Error', msg);
                    }
                    return $q.reject(response);
                } else if (response.status === 404) {
                    $location.path('/');
                    return $q.reject(response);
                } else {
                    $rootScope.instanceModalDialog = dialogs.error('Error', MESSAGES.UNKNOWN_ERROR);
                    return $q.reject(response);
                }


            }
        };
    }

    /**
     * Global controller
     */
    angular
        .module('cignaApp')
        .controller('CustomDialogCtrl', CustomDialogCtrl);
    CustomDialogCtrl.$inject = ['$scope', '$modalInstance', 'data'];
    function CustomDialogCtrl($scope, $modalInstance, data) {
        $scope.msg = data.message;
        $scope.header = data.title;
        $scope.close = function(){
            $modalInstance.close();
            $scope.$destroy();
        };
    };

    /**
     * Run block
     */
    angular
        .module('cignaApp')
        .run(run);

    run.$inject = ['$rootScope', '$location', '$templateCache','$interpolate'];

    function run($rootScope, $location, $templateCache,$interpolate) {
        // put here everything that you need to run on page load

        var startSym = $interpolate.startSymbol();
        var endSym = $interpolate.endSymbol();
        $templateCache.put('/dialogs/custom-close-to-continue.html', '<div class="modal-header dialog-header-error"><button type="button" class="close" ng-click="close()">&times;</button><h4 class="modal-title text-danger"><span class="glyphicon glyphicon-warning-sign"></span> <span ng-bind-html="header"></span></h4></div><div class="modal-body text-danger" ng-bind-html="msg"></div><div class="modal-footer"><button type="button" class="btn btn-default" ng-click="close()">'+startSym+'"DIALOGS_CLOSE_TO_CONTINUE" | translate'+endSym+'</button></div>');
    }


})();

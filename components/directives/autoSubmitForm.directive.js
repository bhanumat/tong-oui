/**
 * Created by phanu on 11/21/2015.
 */
;(function() {

    'use strict';

    /**
     * <div auto-submit-form event="gateway.redirect"></div>
     */

    angular
        .module('cignaApp')
        .directive('autoSubmitForm', autoSubmitForm);
    autoSubmitForm.$inject = ['$timeout'];
    function autoSubmitForm($timeout) {

        // Definition of directive
        var directiveDefinitionObject = {
            replace: true,
            scope: {},
            template: '<form action="{{formData.actionUrl}}" method="{{formData.method}}">'+
            '<div ng-repeat="(key,val) in formData.inputData">'+
            '<input type="hidden" name="{{key}}" value="{{val}}" />'+
            '</div>'+
            '</form>',
            link: function($scope, element, $attrs) {
                $scope.$on($attrs['event'], function(event, data) {
                    $scope.formData = data;
                    console.log('redirecting now!');
                    $timeout(function() {
                        element.submit();
                    })
                })
            }
        };

        return directiveDefinitionObject;
    }

})();
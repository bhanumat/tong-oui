;(function () {

    'use strict';

    angular
        .module('cignaApp')
        .directive('birthDateCalendar', initBirthDateCalendar)

        .directive('nationalId', function () {
            function validateNationalId(pid) {
                pid = pid.toString().replace(/\D/g, '');
                if (pid.length == 13) {
                    var sum = 0;
                    for (var i = 0; i < pid.length - 1; i++) {
                        sum += Number(pid.charAt(i)) * (pid.length - i);
                    }
                    var last_digit = (11 - sum % 11) % 10;
                    return pid.charAt(12) == last_digit;
                } else {
                    return false;
                }
            }

            return {
                require: 'ngModel',
                link: function (scope, ele, attrs, c) {
                    scope.$watch(attrs.ngModel, function (value) {
                        if (value)
                            c.$setValidity('validNationalId', validateNationalId(value));
                    })
                }
            }
        });

    function initBirthDateCalendar() {
        // Definition of directive
        var directiveDefinitionObject = {
            restrict: 'EA',
            link: function (scope, element, attrs) {
                var min = new Date();
                min.setFullYear(min.getFullYear() - scope.travel.maxAge);
                var max = new Date();
                max.setFullYear(max.getFullYear() - scope.travel.minAge);
                return element.datepicker({
                    dateFormat: 'dd MM yy',
                    changeMonth: true,
                    changeYear: true,
                    numberOfMonths: parseInt(attrs["birthDateCalendar"]),
                    maxDate: max,
                    minDate: min,
                    yearRange: "-80:-5",
                    onSelect: function (date) {
                        scope.travel.applicationList[parseInt(attrs["index"])].dateOfBirth = date;
                        scope.$apply();
                    }
                });
            }
        }
        return directiveDefinitionObject;
    }

})();

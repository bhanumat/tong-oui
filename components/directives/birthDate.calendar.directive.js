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
                var minDate = moment(scope.travel.startDate, 'DD MMM YYYY');
                minDate.subtract(scope.travel.maxAge, 'years');
                var min = minDate.toDate();
                var maxDate = moment(scope.travel.startDate, 'DD MMM YYYY');
                maxDate.subtract(scope.travel.minAge, 'years');
                var max = maxDate.toDate();

                var yearRange;
                if( scope.travel.calculateMethod === '01') {
                    max = maxDate.add(11,'months').add(maxDate.endOf('month').date()-maxDate.date(),'days').toDate();
                    yearRange = minDate.year()+':'+maxDate.year();
                } else if (scope.travel.calculateMethod === '02'){
                    min = minDate.subtract(12, 'months').add(1, 'days').toDate();
                    yearRange = minDate.year()+':'+maxDate.year();
                } else {
                    max = maxDate.add(6, 'months').toDate();
                    min = minDate.subtract(6, 'month').add(1, 'days').toDate();
                    yearRange = minDate.year()+':'+maxDate.year();
                }
                console.log('yearRange:',yearRange)
                return element.datepicker({
                    dateFormat: 'dd MM yy',
                    changeMonth: true,
                    changeYear: true,
                    numberOfMonths: parseInt(attrs["birthDateCalendar"]),
                    maxDate: max,
                    minDate: min,
                    yearRange: yearRange,
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

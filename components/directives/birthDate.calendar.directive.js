;(function() {

  'use strict';

  angular
    .module('boilerplate')
    .directive('birthDateCalendar', initBirthDateCalendar);

  function initBirthDateCalendar() {

    // Definition of directive
    var directiveDefinitionObject = {
      restrict: 'EA',
      link: function(scope, element, attrs) {
          
          return element.datepicker({
            dateFormat: 'dd MM yy',
            changeMonth: true,
            changeYear: true,
            numberOfMonths: parseInt(attrs["birthDateCalendar"]),
            maxDate: new Date(),
            onSelect: function(date) {
              scope.travel.passengersProfile[parseInt(attrs["index"])].birthDate = date;
              scope.$apply();
            }
          })
        }
      }
    return directiveDefinitionObject;
  }
})();
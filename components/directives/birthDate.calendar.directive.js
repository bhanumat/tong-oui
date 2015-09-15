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
          var d = new Date();
          d.setYear(d.getYear() - scope.travelData.maxage);
          return element.datepicker({
            dateFormat: 'dd MM yy',
            changeMonth: true,
            changeYear: true,
            numberOfMonths: parseInt(attrs["birthDateCalendar"]),
            maxDate: new Date(),
            minDate: d,
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
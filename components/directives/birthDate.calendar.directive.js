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
          var min = new Date();
          min.setFullYear(min.getFullYear() - scope.travelData.maxage);
          var max = new Date();
          max.setFullYear(max.getFullYear() - 5);
          return element.datepicker({
            dateFormat: 'dd MM yy',
            changeMonth: true,
            changeYear: true,
            numberOfMonths: parseInt(attrs["birthDateCalendar"]),
            maxDate: max,
            minDate: min,
            yearRange: "-80:-5",
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
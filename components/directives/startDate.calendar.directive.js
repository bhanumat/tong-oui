;(function() {

  'use strict';

  /**
   * Main navigation, just a HTML template
   * @author Jozef Butko
   * @ngdoc  Directive
   *
   * @example
   * <main-nav><main-nav/>
   *
   */
  angular
    .module('boilerplate')
    .directive('startDateCalendar', initStartDateCalendar);

  function initStartDateCalendar() {

    // Definition of directive
    var directiveDefinitionObject = {
      restrict: 'EA',
      link: function(scope, element, attrs) {
        scope.$watch("travel.endDate", (function(newValue, oldValue) {
          element.datepicker("option", "maxDate", scope.addDays(scope.tempData.endDateForCal,-1));
          if (scope.tempData.startDateForCal) {
            scope.calcTravelDays();
          }
        }), true);
          
          return element.datepicker({
            dateFormat: 'dd MM yy',
            numberOfMonths: parseInt(attrs["startDateCalendar"]),
            minDate: new Date(),
            onSelect: function(date) {
              scope.travel.startDate = date;
              scope.tempData.startDateForCal = element.datepicker('getDate');
              scope.maxDate = scope.addDays(element.datepicker('getDate'),90);
              scope.minDate = scope.addDays(element.datepicker('getDate'),1);
              scope.$apply();
            }
          })
        }
      }
    return directiveDefinitionObject;
  }
})();
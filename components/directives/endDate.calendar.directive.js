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
    .directive('endDateCalendar', initEndDateCalendar);

  function initEndDateCalendar() {

    // Definition of directive
    var directiveDefinitionObject = {
      restrict: 'EA',
      link: function(scope, element, attrs) {

        scope.$watch("travel.startDate", (function(newValue, oldValue) {
          element.datepicker("option", "minDate", scope.minDate);
          element.datepicker("option", "maxDate", scope.maxDate);
          if (scope.tempData.endDateForCal) {
            scope.calcTravelDays();
          }
        }), true);
          
          return element.datepicker({
            dateFormat: 'dd MM yy',
            numberOfMonths: parseInt(attrs["endDateCalendar"]),
            minDate: new Date(),
            maxDate: scope.maxDate,
            onSelect: function(date) {
              scope.travel.endDate = date;
              scope.tempData.endDateForCal = element.datepicker('getDate');
              var monthname=new Array("ม.ค.","ก.พ.","มี.ค","ม.ย","พ.ค","มิ.ย","ก.ค","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค.");
              var monName = monthname[scope.tempData.endDateForCal.getMonth()];
              scope.tempData.shortEndDate = "" + scope.tempData.endDateForCal.getDate() + " " + monName + " " + scope.tempData.endDateForCal.getFullYear() + "";
              scope.$apply();
            }
          })
        }
      }
    return directiveDefinitionObject;
  }
})();
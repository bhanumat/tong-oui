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
      link: function($scope, element, attrs) {
        $scope.$watch("travel.endDate", (function(newValue, oldValue) {
          
        }), true);
          var min = $scope.addDays(new Date(),1);
          var max = $scope.addDays(new Date(),1);
          max.setFullYear(min.getFullYear()+2);
          return element.datepicker({
            dateFormat: 'dd MM yy',
            numberOfMonths: parseInt(attrs["startDateCalendar"]),
            minDate: min,
            maxDate: max,
            onSelect: function(date) {
              $scope.travel.endDate = '';
              $scope.travel.endDateForCal = '';
              $scope.tempData.daysAsText = '';
              $scope.travel.days = '';
              $scope.travel.startDate = date;
              $scope.tempData.startDateForCal = element.datepicker('getDate');
              $scope.tempData.maxDate = $scope.addDays(element.datepicker('getDate'),$scope.travelData.maxdays);
              $scope.tempData.minDate = $scope.addDays(element.datepicker('getDate'),1);
              var monthname=new Array("ม.ค.","ก.พ.","มี.ค","ม.ย","พ.ค","มิ.ย","ก.ค","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค.");
              var monName = monthname[$scope.tempData.startDateForCal.getMonth()];
              $scope.tempData.shortStartDate = "" + $scope.tempData.startDateForCal.getDate() + " " + monName + " " + $scope.tempData.startDateForCal.getFullYear() + "";
              $scope.$apply();
            }
          })
        }
      }
    return directiveDefinitionObject;
  }
})();
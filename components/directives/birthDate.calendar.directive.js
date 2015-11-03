;(function() {

  'use strict';

  angular
    .module('cignaApp')
    .directive('birthDateCalendar', initBirthDateCalendar);

  function initBirthDateCalendar() {

    // Definition of directive
    var directiveDefinitionObject = {
      restrict: 'EA',
      link: function(scope, element, attrs, model) {
          var min = new Date();
          if(!scope.travelData.maxage)
              scope.travelData.maxage = 80;
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
                model = date;
                scope.$apply();
            }
          })
        }
      }
    return directiveDefinitionObject;
  }
})();

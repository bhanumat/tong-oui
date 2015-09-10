;
(function($) {

    /**
     * In genereal you should avoid to use jQuery code in AngularJS
     * apps, if you need any jQuery functionality create a directive
     *
     */

    jQuery(document).ready(function($){
		$(this).on('focus','.cardnumber',function(){
			$('.cardnumber').autotab('cardnumber');
		});
	});


})(jQuery);
;
(function($) {

    /**
     * In genereal you should avoid to use jQuery code in AngularJS
     * apps, if you need any jQuery functionality create a directive
     *
     */

    jQuery(document).ready(function($){
		$(this).on('mouseover','#plan-main',function(){
			$('#plan-main-scroll').on('scroll',function(){
				$('#plan-options-scroll').scrollLeft($(this).scrollLeft());
			});
		});
		$(this).on('mouseover','#plan-options',function(){
			$('#plan-options-scroll').on('scroll',function(){
				$('#plan-main-scroll').scrollLeft($(this).scrollLeft());
			});
		});

	});


})(jQuery);
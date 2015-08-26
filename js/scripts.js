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
				$('#plan-options1-scroll').scrollLeft($(this).scrollLeft());
				$('#plan-options2-scroll').scrollLeft($(this).scrollLeft());
			});
		});
		$(this).on('mouseover','#plan-options',function(){
			$('#plan-options1-scroll').on('scroll',function(){
				$('#plan-main-scroll').scrollLeft($(this).scrollLeft());
				$('#plan-options2-scroll').scrollLeft($(this).scrollLeft());
			});
			$('#plan-options2-scroll').on('scroll',function(){
				$('#plan-main-scroll').scrollLeft($(this).scrollLeft());
				$('#plan-options1-scroll').scrollLeft($(this).scrollLeft());
			});
		});

	});


})(jQuery);
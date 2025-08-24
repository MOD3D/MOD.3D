
  (function ($) {
  
  "use strict";

    // COUNTER NUMBERS
    jQuery('.counter-thumb').appear(function() {
      jQuery('.counter-number').countTo();
    });
    
    // $('.smoothscroll').click(function(){
    //   var el = $(this).attr('href');
    //   var elWrapped = $(el);
    //   var header_height = $('.navbar').height();

    //   scrollToDiv(elWrapped,header_height);
    //   return false;

    //   function scrollToDiv(element,navheight){
    //     var offset = element.offset();
    //     var offsetTop = offset.top;
    //     var totalScroll = offsetTop-navheight;

    //     $('body,html').animate({
    //     scrollTop: totalScroll
    //     }, 300);
    //   }
    // });
    
  })(window.jQuery);



function goToService(serviceId) {
    window.location.href = `services.html?tab=${serviceId}#section_3`;
}


document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam) {
        setTimeout(() => {
            const targetTab = document.getElementById(tabParam + '-tab');
            if (targetTab) {
                targetTab.click();
                document.getElementById('section_3').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            }
        }, 100);
    }
});

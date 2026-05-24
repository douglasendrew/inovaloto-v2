'use strict';
var range_slider_custom = {
    init: function() { 
        $("#range-active-1").ionRangeSlider(),
        $("#range-active-2").ionRangeSlider({
            min: 100,
            max: 1000,
            from: 550
        }),$("#range-active-3").ionRangeSlider({
            type: "double",
            grid: true,
            min: 0,
            max: 1000,
            from: 200, 
            to: 800,
            prefix: "$"
        }),$("#range-active-4").ionRangeSlider({
            type: "double",
            grid: true,
            min: -1000,
            max: 1000,
            from: -500,
            to: 500
        }), $("#range-active-5").ionRangeSlider({
            type: "double",
            grid: true,
            min: -1000,
            max: 1000,
            from: -500,
            to: 500,
            step: 250
        }), $("#range-active-6").ionRangeSlider({
            grid: true,
            from: 3,
            values: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        }), $("#range-active-7").ionRangeSlider({
            grid: true,
            min: 1000,
            max: 10000,
            from: 2000,
            step: 100,
            prettify_enabled: true
        }), $("#range-active-8").ionRangeSlider({
            min: 100,
            max: 1000,
            from: 550,
            disable: true
        });
    }
};
(function($) {
    "use strict";
    range_slider_custom.init();
})(jQuery);
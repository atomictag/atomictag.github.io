

(function() {

    function isMobile() {
         if( navigator.userAgent.match(/Android/i)
         || navigator.userAgent.match(/iPhone/i)
         || navigator.userAgent.match(/iPad/i)
         || navigator.userAgent.match(/iPod/i)
         || navigator.userAgent.match(/Windows Phone/i)
         ){
            return true;
          }
         else {
            return false;
          }
    }

    // Constants
    var TABLET_MIN_WIDTH = 553;
    var DESKTOP_MIN_WIDTH = 1281;

    // Capabilities
    var caps = {
        device : {},
        cordova : false
    };

    // Device detection (ios, ios7, android, browser). Both js (ooze.device.* and html class)
    var ua   = navigator.userAgent;
    var html = document.documentElement;

    // Add/remove class to the html node
    function addClass(c) {
        html.className = html.className + ' ' + c;
    };
    function removeClass(c) {
        html.className = html.className.replace(new RegExp(c + '\\s*', 'g'), '').trim();
    };
    // Add class to the html node and to caps.device. Dashes are replaced with underscore.
    function addDeviceClass(c) {
        addClass(c);
        caps.device[c.replace(/-/g, '_')] = true;
    };
    function removeDeviceClass(c) {
        removeClass(c);
        caps.device[c.replace(/-/g, '_')] = undefined;
    }

    // UA sniffing
    if( /(iPhone|iPad|iPod)/i.test(ua) ) {
        // ios
        addDeviceClass('ios');
        var os = ua.replace(/.*?CPU.*OS\s([\d_]+)\b.*/, '$1'),
            comps = os.split('_'),
            versionString = 'os';
        // Attach os string to caps. Separator is '_'
        caps.device.os = os;
        // ios6, ios7 ...
        addDeviceClass('ios' + os[0]);
        // os_7 os_7_0 os_7_0_2
        for(var i in comps) {
            versionString += '_' + comps[i];
            addDeviceClass(versionString);
        }
        // iphone, ipad. Note: Sometimes (only on sim?) the UA for iPad says "iPhone"
        if( /(iPhone|iPod)/i.test(ua)) {
            addDeviceClass('iphone');
        }
        else {
            addDeviceClass('ipad');
        }
    } else if( /android/i.test(ua) ) {
        // android
        addDeviceClass('android');
        var os = ua.replace(/.*?Android\s([\d.]+)\b.*/i, '$1').replace(/\./g, '_'),
            comps = os.split('_'),
            versionString = 'os';
        // Attach os string to caps. Separator is '_'
        caps.device.os = os;
        // android3, android4
        addDeviceClass('android' + os[0]);
        // android_4 android_4_0 android_4_0_2
        for(var i in comps) {
            versionString += '_' + comps[i];
            addDeviceClass(versionString);
        }
        // webkit or chrome
        if( /chrome/i.test(ua) ) {
            addDeviceClass('android-chrome');
        }
        else {
            addDeviceClass('android-webkit');
        }
    } else {
        addDeviceClass('browser');
    }

    function computeFormFactor() {
        // Reset (in case this fn is called multiple times, e.g. in a browser)
        removeDeviceClass('form-factor-phone');
        removeDeviceClass('form-factor-tablet');
        removeDeviceClass('form-factor-desktop');

        // Desktop
        if(!isMobile()) {
            addDeviceClass('form-factor-desktop');
            return;
        }

        // Compute the "portrait width", taking into account status bars and pixel ratio multipliers
        var vpW = window.innerWidth, vpH = window.innerHeight;
        var scW = window.screen.width, scH = window.screen.height;
        var dpr = window.devicePixelRatio || 1;
        var width = ( scW / dpr === vpW || scH / dpr === vpH ) ? Math.min(scW / dpr, scH / dpr) : Math.min(scW, scH);

        // Phone is default
        var formFactor = 'phone';
        // Tablet
        if(width >= TABLET_MIN_WIDTH) {
            formFactor = 'tablet';
        }

        addDeviceClass('form-factor-' + formFactor);

    }
    computeFormFactor();

    // Recompute the form-factor on desktops
    // if(caps.device.browser) {
    //     window.addEventListener('resize', function() {
    //         computeFormFactor();
    //     }, false);
    // }

    // Check for cordova. Depending on whether cordova has already been included
    // checking for window.cordova may not make that much sense here (especially
    // if the goal is to inject the cordova script if not already defined). So
    // here we check if we need to load cordova by simply checking the URL
    if (window.cordova || document.URL.indexOf( 'http' ) !== 0 ) {
        // Cordova application
        caps.cordova = true;
        addClass('cordova');
    }

    // Mobile?
    caps.device.mobile = caps.device.form_factor_phone || caps.device.form_factor_tablet;

    // Apply caps to ooze
    var ooze = window.ooze = window.ooze || {};
    for(var key in caps) {
        ooze[key] = caps[key];
    }

})();
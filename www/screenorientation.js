    var screenOrientation = {};
    if (!window.OrientationType) {
        window.OrientationType = {
            'portrait-primary': 0,
            'portrait-secondary': 180,
            'landscape-primary': 90,
            'landscape-secondary': -90
        };
    }
    if (!window.OrientationLockType) {
        window.OrientationLockType = {
            'portrait-primary': 1,
            'portrait-secondary': 2,
            'landscape-primary': 4,
            'landscape-secondary': 8,
            portrait: 3, // either portrait-primary or portrait-secondary.
            landscape: 12, // either landscape-primary or landscape-secondary.
            any: 15 // All orientations are supported (unlocked orientation)
        };
    }
    var orientationMask = 1;
    screenOrientation.setOrientation = function (orientation) {
        orientationMask = window.OrientationLockType[orientation];
        cordova.exec(null, null, 'CDVOrientation', 'screenOrientation', [orientationMask, orientation]);
    };
    
    screenOrientation.lock = function (orientation) {
        var p = new Promise(function (resolve, reject) {
            resolveOrientation(orientation, resolve, reject);
        });
        return p;
    };
    
    screenOrientation.unlock = function () {
        screenOrientation.setOrientation('any');
    };
    
    setOrientationProperties();
    
    var autoRotateTypeResult = null;
    
    
    function autoRotateTypeResultSuccess(callback){
        if(callback != null){
            autoRotateTypeResult = callback;
        }
        return autoRotateTypeResult;
    }
    
    function autoRotateTypeResultfail(){
        var message = "Result null"
        return message;
    }
    
    screenOrientation.getAutoRotate = function() {
        cordova.exec(autoRotateTypeResultSuccess,autoRotateTypeResultfail,'CDVOrientation', 'rotateType',null);
    };
    
    screenOrientation.getAutoRotateType = function(){
        return autoRotateTypeResult;
    }
    
    function resolveOrientation (orientation, resolve, reject) {
        if (!Object.prototype.hasOwnProperty.call(OrientationLockType, orientation)) {
            var err = new Error();
            err.name = 'NotSupportedError';
            reject(err); // "cannot change orientation");
        } else {
            screenOrientation.setOrientation(orientation);
            resolve('Orientation set'); // orientation change successful
        }
    }
    
    var onChangeListener = null;
    
    Object.defineProperty(screenOrientation, 'onchange', {
        set: function (listener) {
            if (onChangeListener) {
                screenOrientation.removeEventListener('change', onChangeListener);
            }
            onChangeListener = listener;
            if (onChangeListener) {
                screenOrientation.addEventListener('change', onChangeListener);
            }
        },
        get: function () {
            return onChangeListener || null;
        },
        enumerable: true
    });
    
    var evtTarget = new XMLHttpRequest(); // document.createElement('div');
    var orientationchange = function () {
        setOrientationProperties();
        var event = document.createEvent('Events');
        event.initEvent('change', false, false);
        evtTarget.dispatchEvent(event);
    };
    
    screenOrientation.addEventListener = function (a, b, c) {
        return evtTarget.addEventListener(a, b, c);
    };
    
    screenOrientation.removeEventListener = function (a, b, c) {
        return evtTarget.removeEventListener(a, b, c);
    };
    
    function setOrientationProperties () {
        switch (window.orientation) {
        case 0:
            screenOrientation.type = 'portrait-primary';
            break;
        case 90:
            screenOrientation.type = 'landscape-primary';
            break;
        case 180:
            screenOrientation.type = 'portrait-secondary';
            break;
        case -90:
            screenOrientation.type = 'landscape-secondary';
            break;
        }
        screenOrientation.angle = window.orientation || 0;
    }
    window.addEventListener('orientationchange', orientationchange, true);
    
    document.addEventListener('pause',function(){
        screenOrientation.unlock();
    });
    
    module.exports = screenOrientation;

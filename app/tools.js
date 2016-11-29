'use strict';
/**
 * Created by chao on 2016/11/29.
 */

module.exports = {
    clone: function copy(source, destination) {
        let toString = {}.toString;

        function isDate(value) {
            return toString.apply(value) == '[object Date]';
        }

        function isArray(value) {
            return toString.apply(value) == '[object Array]';
        }

        function isRegExp(value) {
            return toString.apply(value) == '[object RegExp]';
        }

        function isObject(value) {
            return value != null && typeof value == 'object';
        }

        /**
         * Set or clear the hashkey for an object.
         * @param obj object
         * @param h the hashkey (!truthy to delete the hashkey)
         */
        function setHashKey(obj, h) {
            if (h) {
                obj.$$hashKey = h;
            }
            else {
                delete obj.$$hashKey;
            }
        }

        if (!destination) {
            destination = source;
            if (source) {
                if (isArray(source)) {
                    destination = copy(source, []);
                } else if (isDate(source)) {
                    destination = new Date(source.getTime());
                } else if (isRegExp(source)) {
                    destination = new RegExp(source.source);
                } else if (isObject(source)) {
                    destination = copy(source, {});
                }
            }
        } else {
            if (source === destination) {
                return new Error('cpi', "Can't copy! Source and destination are identical.");
            }
            if (isArray(source)) {
                destination.length = 0;
                for (let i = 0; i < source.length; i++) {
                    destination.push(copy(source[i]));
                }
            } else {
                let h = destination.$$hashKey;
                for (let key in destination) {
                    delete destination[key];
                }
                for (let key in source) {
                    destination[key] = copy(source[key]);
                }
                setHashKey(destination, h);
            }
        }
        return destination;
    }
}
;
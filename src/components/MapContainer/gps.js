export default {
    useGoogle:true,
    PI : 3.14159265358979324,
    x_pi : 3.14159265358979324 * 3000.0 / 180.0,
    delta : function (lat, lng) {
       
        var a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
        var ee = 0.00669342162296594323; //  ee: 椭球的偏心率。
        var dLat = this.transformLat(lng - 105.0, lat - 35.0);
        var dlng = this.transformlng(lng - 105.0, lat - 35.0);
        var radLat = lat / 180.0 * this.PI;
        var magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * this.PI);
        dlng = (dlng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * this.PI);
        return {'lat': dLat, 'lng': dlng};
    },
     
    //WGS-84 to GCJ-02
    gcj_encrypt : function (wgsLat, wgslng) {
        if (this.outOfChina(wgsLat, wgslng))
            return {'lat': wgsLat, 'lng': wgslng};
 
        var d = this.delta(wgsLat, wgslng);
        return {'lat' : wgsLat + d.lat,'lng' : wgslng + d.lng};
    },
    //GCJ-02 to WGS-84
    gcj_decrypt : function (gcjLat, gcjlng) {
        if (this.outOfChina(gcjLat, gcjlng))
            return {'lat': gcjLat, 'lng': gcjlng};
         
        var d = this.delta(gcjLat, gcjlng);
        return {'lat': gcjLat - d.lat, 'lng': gcjlng - d.lng};
    },
    //GCJ-02 to WGS-84 exactly
    gcj_decrypt_exact : function (gcjLat, gcjlng) {
        var initDelta = 0.01;
        var threshold = 0.000000001;
        var dLat = initDelta, dlng = initDelta;
        var mLat = gcjLat - dLat, mlng = gcjlng - dlng;
        var pLat = gcjLat + dLat, plng = gcjlng + dlng;
        var wgsLat, wgslng, i = 0;
        while (1) {
            wgsLat = (mLat + pLat) / 2;
            wgslng = (mlng + plng) / 2;
            var tmp = this.gcj_encrypt(wgsLat, wgslng)
            dLat = tmp.lat - gcjLat;
            dlng = tmp.lng - gcjlng;
            if ((Math.abs(dLat) < threshold) && (Math.abs(dlng) < threshold))
                break;
 
            if (dLat > 0) pLat = wgsLat; else mLat = wgsLat;
            if (dlng > 0) plng = wgslng; else mlng = wgslng;
 
            if (++i > 10000) break;
        }
        //console.log(i);
        return {'lat': wgsLat, 'lng': wgslng};
    },
    //GCJ-02 to BD-09
    bd_encrypt : function (gcjLat, gcjlng) {
        var x = gcjlng, y = gcjLat;  
        var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this.x_pi);  
        var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this.x_pi);  
        var bdlng = z * Math.cos(theta) + 0.0065;  
        var bdLat = z * Math.sin(theta) + 0.006; 
        return {'lat' : bdLat,'lng' : bdlng};
    },
    //BD-09 to GCJ-02
    bd_decrypt : function (bdLat, bdlng) {
        var x = bdlng - 0.0065, y = bdLat - 0.006;  
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.x_pi);  
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.x_pi);  
        var gcjlng = z * Math.cos(theta);  
        var gcjLat = z * Math.sin(theta);
        return {'lat' : gcjLat, 'lng' : gcjlng};
    },
    //WGS-84 to Web mercator
    //mercatorLat -> y mercatorlng -> x
    mercator_encrypt : function(wgsLat, wgslng) {
        var x = wgslng * 20037508.34 / 180.;
        var y = Math.log(Math.tan((90. + wgsLat) * this.PI / 360.)) / (this.PI / 180.);
        y = y * 20037508.34 / 180.;
        return {'lat' : y, 'lng' : x};
        /*
        if ((Math.abs(wgslng) > 180 || Math.abs(wgsLat) > 90))
            return null;
        var x = 6378137.0 * wgslng * 0.017453292519943295;
        var a = wgsLat * 0.017453292519943295;
        var y = 3189068.5 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)));
        return {'lat' : y, 'lng' : x};
        //*/
    },
    // Web mercator to WGS-84
    // mercatorLat -> y mercatorlng -> x
    mercator_decrypt : function(mercatorLat, mercatorlng) {
        var x = mercatorlng / 20037508.34 * 180.;
        var y = mercatorLat / 20037508.34 * 180.;
        y = 180 / this.PI * (2 * Math.atan(Math.exp(y * this.PI / 180.)) - this.PI / 2);
        return {'lat' : y, 'lng' : x};
        /*
        if (Math.abs(mercatorlng) < 180 && Math.abs(mercatorLat) < 90)
            return null;
        if ((Math.abs(mercatorlng) > 20037508.3427892) || (Math.abs(mercatorLat) > 20037508.3427892))
            return null;
        var a = mercatorlng / 6378137.0 * 57.295779513082323;
        var x = a - (Math.floor(((a + 180.0) / 360.0)) * 360.0);
        var y = (1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * mercatorLat) / 6378137.0)))) * 57.295779513082323;
        return {'lat' : y, 'lng' : x};
        //*/
    },
    // two point's distance
    distance : function (latA, lngA, latB, lngB) {
        var earthR = 6371000.;
        var x = Math.cos(latA * this.PI / 180.) * Math.cos(latB * this.PI / 180.) * Math.cos((lngA - lngB) * this.PI / 180);
        var y = Math.sin(latA * this.PI / 180.) * Math.sin(latB * this.PI / 180.);
        var s = x + y;
        if (s > 1) s = 1;
        if (s < -1) s = -1;
        var alpha = Math.acos(s);
        var distance = alpha * earthR;
        return distance;
    },
    outOfChina : function (lat, lng) {
        if (lng < 72.004 || lng > 137.8347)
            return true;
        if (lat < 0.8293 || lat > 55.8271)
            return true;
        return false;
    },
    transformLat : function (x, y) {
        var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * this.PI) + 40.0 * Math.sin(y / 3.0 * this.PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * this.PI) + 320 * Math.sin(y * this.PI / 30.0)) * 2.0 / 3.0;
        return ret;
    },
    transformlng : function (x, y) {
        var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * this.PI) + 40.0 * Math.sin(x / 3.0 * this.PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * this.PI) + 300.0 * Math.sin(x / 30.0 * this.PI)) * 2.0 / 3.0;
        return ret;
    },

    wgs2bd: function (lng, lat) {
        var LatLng = this.gcj_encrypt(lat, lng);
        return this.bd_encrypt(LatLng.lat, LatLng.lng);
    },

    bd2wgs: function (lng, lat) {
        var LatLng = this.bd_decrypt(lat, lng);
        return this.gcj_decrypt(LatLng.lat, LatLng.lng);
    },
    wgs2google: function (lng, lat) {
        if (lng > 1800 || lng < -1800)
            return { 'lat': lat, 'lng': lng };
        var tmp = this.gcj_encrypt(lat, lng);
        return this.mercator_encrypt(tmp.lat, tmp.lng);
    },
    google2wgs: function (lng, lat) {
        if (lng < 1800 && lng > -1800)
            return { 'lat': lat, 'lng': lng };
        var tmp = this.mercator_decrypt(lat, lng);
        return this.gcj_decrypt(tmp.lat, tmp.lng);
    },   
     google2wgs2: function (lng, lat) {
        // if (lng < 1800 && lng > -1800)
        //     return { 'lat': lat, 'lng': lng };
        // var tmp = this.mercator_decrypt(lat, lng);
        return this.gcj_decrypt(lat, lng);
    },

    bd2google: function (lng, lat) {
        var tmp = this.bd_decrypt(lat, lng);
        return this.mercator_encrypt(tmp.lat, tmp.lng);
    },

    tencent2google: function (lng, lat) {
        return this.mercator_encrypt(lat, lng);
    },
    tencent2wgs: function (lng, lat) {
        return this.gcj_decrypt(lat, lng);
    },

};
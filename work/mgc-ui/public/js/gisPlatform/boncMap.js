/**
 * Created by ngm on 2017/9/8.
 */
/*$(function () {

    var pureCoverage = false;
    // if this is just a coverage or a group of them, disable a few items,
    // and default to jpeg format
    var format = 'image/png';
    var bounds = [73.44696044921875, 6.318641185760498,
        135.08583068847656, 53.557926177978516];

    var mousePositionControl = new ol.control.MousePosition({
        className: 'custom-mouse-position',
        target: document.getElementById('location'),
        coordinateFormat: ol.coordinate.createStringXY(5),
        undefinedHTML: '&nbsp;'
    });
    var untiled = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://172.16.11.43:8080/geoserver/china/wms',
            params: {'FORMAT': format,
                'VERSION': '1.1.1',
                STYLES: '',
                LAYERS: 'china:china_sheng',
            }
        })
    });
    var tiled = new ol.layer.Tile({
        visible: false,
        source: new ol.source.TileWMS({
            url: 'http://172.16.11.43:8080/geoserver/china/wms',
            params: {'FORMAT': format,
                'VERSION': '1.1.1',
                tiled: true,
                STYLES: '',
                LAYERS: 'china:china_sheng',
                tilesOrigin: 73.44696044921875 + "," + 6.318641185760498
            }
        })
    });
    var projection = new ol.proj.Projection({
        code: 'EPSG:4490',
        units: 'degrees',
        axisOrientation: 'neu',
        global: true
    });
    var map = new ol.Map({
        controls: ol.control.defaults({
            attribution: false
        }).extend([mousePositionControl]),
        target: 'map',
        layers: [
            untiled,
            tiled
        ],
        view: new ol.View({
            projection: projection
        })
    });
    map.getView().on('change:resolution', function(evt) {
        var resolution = evt.target.get('resolution');
        var units = map.getView().getProjection().getUnits();
        var dpi = 25.4 / 0.28;
        var mpu = ol.proj.METERS_PER_UNIT[units];
        var scale = resolution * mpu * 39.37 * dpi;
        if (scale >= 9500 && scale <= 950000) {
            scale = Math.round(scale / 1000) + "K";
        } else if (scale >= 950000) {
            scale = Math.round(scale / 1000000) + "M";
        } else {
            scale = Math.round(scale);
        }
        //document.getElementById('scale').innerHTML = "Scale = 1 : " + scale;
    });
    map.getView().fit(bounds, map.getSize());
    map.on('singleclick', function(evt) {
        //document.getElementById('nodelist').innerHTML = "Loading... please wait...";
        var view = map.getView();
        var viewResolution = view.getResolution();
        var source = untiled.get('visible') ? untiled.getSource() : tiled.getSource();
        var url = source.getGetFeatureInfoUrl(
            evt.coordinate, viewResolution, view.getProjection(),
            {'INFO_FORMAT': 'text/html', 'FEATURE_COUNT': 50});
        if (url) {
            //document.getElementById('nodelist').innerHTML = '<iframe seamless src="' + url + '"></iframe>';
        }
    });



})*/

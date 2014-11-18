define([
    'underscore',
    'backbone',
    'openlayers',
    'eventbus',
    'config',
    'models/Layer'
], function (_, Backbone, ol, EventBus, Config, Layer) {

    /**
     *
     */
    var WMSLayer = Layer.extend({
        /**
         *
         */
        setAttributionLayerSource: function () {
            if (this.get('version') && this.get('version') != '' && this.get('version') != 'nicht vorhanden') {
                var version = this.get('version');
            }
            else {
                var version = '1.3.0';
            }
            if (this.get('format') && this.get('format') != '' && this.get('format') != 'nicht vorhanden') {
                var format = this.get('format');
            }
            else {
                var format = 'image/png';
            }
            if (version === '1.1.1' || version === '1.1.0' || version === '1.0.0') {
                var params = {
                    'LAYERS': this.get('layers'),
                    'FORMAT': format,
                    'VERSION': version,
                    'SRS': 'EPSG:25832'
                }
            }
            else {
                var params = {
                    'LAYERS': this.get('layers'),
                    'FORMAT': format,
                    'VERSION': version,
                    'CRS': 'EPSG:25832'
                }
            }
            this.set('source', new ol.source.TileWMS({
                url: this.get('url'),
                params: params,
                tileGrid: new ol.tilegrid.TileGrid({
                    resolutions: [
                        66.14614761460263,
                        26.458319045841044,
                        15.874991427504629,
                        10.583327618336419,
                        5.2916638091682096,
                        2.6458319045841048,
                        1.3229159522920524,
                        0.6614579761460262,
                        0.2645831904584105
                    ],
                    origin: [
                        442800,
                        5809000
                    ]
                })
            }));
            console.log (this.get('source'));
        },
        /**
         *
         */
        setAttributionLayer: function () {
            this.set('layer', new ol.layer.Tile({
                source: this.get('source'),
                name: this.get('name'),
                typ: this.get('typ'),
                gfiAttributes: this.get('gfiAttributes')
            }));
        }
    });
    return WMSLayer;
});

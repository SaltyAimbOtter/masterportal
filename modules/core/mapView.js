define([
    "backbone",
    "backbone.radio",
    "openlayers",
    "config",
    "proj4"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Config = require("config"),
        proj4 = require("proj4"),
        MapView;

    MapView = Backbone.Model.extend({
        /**
         *
         */
        defaults: {
            background: "",
            backgroundImage: "",
            startExtent: [510000.0, 5850000.0, 625000.4, 6000000.0],
            options: [
                {
                    resolution: 66.14579761460263,
                    scale: "250000",
                    zoomLevel: 0
                },
                {
                    resolution: 26.458319045841044,
                    scale: "100000",
                    zoomLevel: 1
                },
                {
                    resolution: 15.874991427504629,
                    scale: "60000",
                    zoomLevel: 2
                },
                {
                    resolution: 10.583327618336419,
                    scale: "40000",
                    zoomLevel: 3
                },
                {
                    resolution: 5.2916638091682096,
                    scale: "20000",
                    zoomLevel: 4
                },
                {
                    resolution: 2.6458319045841048,
                    scale: "10000",
                    zoomLevel: 5
                },
                {
                    resolution: 1.3229159522920524,
                    scale: "5000",
                    zoomLevel: 6
                },
                {
                    resolution: 0.6614579761460262,
                    scale: "2500",
                    zoomLevel: 7
                },
                {
                    resolution: 0.2645831904584105,
                    scale: "1000",
                    zoomLevel: 8
                },
                {
                    resolution: 0.13229159522920521,
                    scale: "500",
                    zoomLevel: 9
                }
            ],
            resolution: 15.874991427504629,
            startCenter: [565874, 5934140],
            units: "m",
            DOTS_PER_INCH: $("#dpidiv").outerWidth() // Hack um die Bildschirmauflösung zu bekommen
        },

        /**
         *
         */
        initialize: function () {
            var channel = Radio.channel("MapView");

            channel.reply({
                "getProjection": function () {
                    return this.get("projection");
                },
                "getOptions": function () {
                    return (_.findWhere(this.get("options"), {resolution: this.get("resolution")}));
                },
                "getCenter": function () {
                    return this.getCenter();
                },
                "getZoomLevel": function () {
                    return this.getZoom();
                },
                "getResolutions": function () {
                    return this.getResolutions();
                }
            }, this);

            channel.on({
                "setCenter": this.setCenter,
                "toggleBackground": this.toggleBackground,
                "setZoomLevelUp": this.setZoomLevelUp,
                "setZoomLevelDown": this.setZoomLevelDown,
                "setScale": this.setScale,
                "resetView": this.resetView
            }, this);

            this.listenTo(this, {
                "change:resolution": function () {
                    channel.trigger("changedOptions", _.findWhere(this.get("options"), {resolution: this.get("resolution")}));
                },
                "change:center": function () {
                    channel.trigger("changedCenter", this.getCenter());
                },
                "change:scale": function () {
                    var params = _.findWhere(this.get("options"), {scale: this.get("scale")});

                    this.set("resolution", params.resolution);
                    this.get("view").setResolution(this.get("resolution"));
                },
                "change:background": function (model, value) {
                    if (value === "white") {
                        $("#map").css("background", "white");
                    }
                    else {
                        $("#map").css("background", "url('" + value + "') repeat scroll 0 0 rgba(0, 0, 0, 0)");
                    }
                }
            });

            this.setConfig();
            this.setOptions();
            this.setScales();
            this.setResolutions();
            this.setZoomLevels();

            this.setExtent();
            this.setResolution();
            this.setStartCenter();
            this.setProjection();
            this.setView();

            // Listener für ol.View
            this.get("view").on("change:resolution", function () {
                this.set("resolution", this.get("view").getResolution());
                channel.trigger("changedZoomLevel", this.getZoom());
            }, this);
            this.get("view").on("change:center", function () {
                this.set("center", this.get("view").getCenter());
            }, this);
        },
        resetView: function () {
            this.get("view").setCenter(this.get("startCenter"));
            this.get("view").setZoom(2);
        },

        /*
        * Finalisierung der Initialisierung für config.json
        */
        setConfig: function () {
            _.each(Radio.request("Parser", "getItemsByAttributes", {type: "mapView"}), function (setting) {
                switch (setting.id) {
                case "backgroundImage": {
                    this.set("backgroundImage", setting.attr);

                    this.setBackground(setting.attr);
                    break;
                }
                }
            }, this);
        },

        setBackground: function (value) {
            this.set("background", value);
        },

        getBackground: function () {
            return this.get("background");
        },

        toggleBackground: function () {
            if (this.getBackground() === "white") {
                this.setBackground(this.get("backgroundImage"));
            }
            else {
                this.setBackground("white");
            }
        },

        setOptions: function () {
            if (_.has(Config.view, "options")) {
                this.set("options", []);
                _.each(Config.view.options, function (opt) {
                    this.pushHits("options", opt);
                }, this);
            }
        },

        setScales: function () {
            this.set("scales", _.pluck(this.get("options"), "scale"));
        },

        setResolutions: function () {
            if (Config.view.resolutions && _.isArray(Config.view.resolutions)) {
                this.set("resolutions", Config.view.resolutions);
            }
            else {
                this.set("resolutions", _.pluck(this.get("options"), "resolution"));
            }
        },

        setZoomLevels: function () {
            this.set("zoomLevels", _.pluck(this.get("options"), "zoomLevel"));
        },

        /**
         *
         */
        setExtent: function () {
            if (Config.view.extent && _.isArray(Config.view.extent) && Config.view.extent.length === 4) {
                this.set("extent", Config.view.extent);
            }
        },

        // Setzt die Resolution.
        setResolution: function () {
            if (Config.view.resolution && _.isNumber(Config.view.resolution)) {
                this.set("resolution", Config.view.resolution);
            }
            if (_.has(Config.view, "zoomLevel")) {
                this.set("resolution", this.get("resolutions")[Config.view.zoomLevel]);
            }
        },

        // Setzt den Maßstab.
        setScale: function (scale) {
            this.set("scale", scale);
        },

        /**
         *
         */
        setStartCenter: function () {
            if (Config.view.center && _.isArray(Config.view.center)) {
                this.set("startCenter", Config.view.center);
            }
        },

        /**
         *
         */
        setProjection: function () {
            // supported projections
            switch (Config.view.epsg){
                case "EPSG:25833": {
                    proj4.defs("EPSG:25833", "+proj=utm +zone=33 +ellps=WGS84 +towgs84=0,0,0,0,0,0,1 +units=m +no_defs");
                    break;
                }
                case "EPSG:31468": {
                    proj4.defs("EPSG:31468", "+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +datum=potsdam +units=m +no_defs ");
                    break;
                }
                default: {
                    proj4.defs("EPSG:25832", "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
                    break;
                }
            }

            var proj = new ol.proj.Projection({
                code: Config.view.epsg || "EPSG:25832",
                units: this.get("units"),
                extent: this.get("extent"),
                axisOrientation: "enu",
                global: false
            });

            ol.proj.addProjection(proj);

            // attach epsg and projection object to Config.view for further access by other modules
            Config.view.epsg = proj.getCode();
            Config.view.proj = proj;

            this.set("projection", proj);
        },

        /**
         *
         */
        setView: function () {
            var view = new ol.View({
                projection: this.get("projection"),
                center: this.get("startCenter"),
                extent: this.get("extent"),
                resolution: this.get("resolution"),
                resolutions: this.get("resolutions")
            });

            this.set("view", view);
        },

        /**
         *
         */
        setCenter: function (coords, zoomLevel) {
            this.get("view").setCenter(coords);
            if (!_.isUndefined(zoomLevel)) {
                this.get("view").setZoom(zoomLevel);
            }
        },

        /**
         *
         */
        setZoomLevelUp: function () {
            this.get("view").setZoom(this.getZoom() + 1);
        },

        /**
         *
         */
        setZoomLevelDown: function () {
            this.get("view").setZoom(this.getZoom() - 1);
        },

        getCenter: function () {
            return this.get("view").getCenter();
        },

        getResolution: function (scale) {
            var units = this.get("units"),
                mpu = ol.proj.METERS_PER_UNIT[units],
                dpi = this.get("DOTS_PER_INCH"),
                resolution = scale / (mpu * 39.37 * dpi);

            return resolution;
        },

        getResolutions: function () {
            return this.get("resolutions");
        },

        /**
         *
         * @return {[type]} [description]
         */
        getZoom: function () {
            return this.get("view").getZoom();
        },

        pushHits: function (attribute, value) {
            var tempArray = _.clone(this.get(attribute));

            tempArray.push(value);
            this.set(attribute, _.flatten(tempArray));
        }
    });

    return MapView;
});

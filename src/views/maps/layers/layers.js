var wms_layers = [];


        var lyr_googlesatelital_0 = new ol.layer.Tile({
            'title': 'google satelital',
            'type': 'base',
            'opacity': 1.000000,
            
            
            source: new ol.source.XYZ({
    attributions: ' ',
                url: 'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}'
            })
        });
var format_LIMITESCAMPOSC_1 = new ol.format.GeoJSON();
var features_LIMITESCAMPOSC_1 = format_LIMITESCAMPOSC_1.readFeatures(json_LIMITESCAMPOSC_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_LIMITESCAMPOSC_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_LIMITESCAMPOSC_1.addFeatures(features_LIMITESCAMPOSC_1);
var lyr_LIMITESCAMPOSC_1 = new ol.layer.Vector({
                declutter: true,
                source:jsonSource_LIMITESCAMPOSC_1, 
                style: style_LIMITESCAMPOSC_1,
                interactive: true,
                title: '<img src="styles/legend/LIMITESCAMPOSC_1.png" /> LIMITES CAMPO SC'
            });

lyr_googlesatelital_0.setVisible(true);lyr_LIMITESCAMPOSC_1.setVisible(true);
var layersList = [lyr_googlesatelital_0,lyr_LIMITESCAMPOSC_1];
lyr_LIMITESCAMPOSC_1.set('fieldAliases', {'Layer': 'Layer', 'PaperSpace': 'PaperSpace', 'SubClasses': 'SubClasses', 'Linetype': 'Linetype', 'EntityHandle': 'EntityHandle', 'Text': 'Text', });
lyr_LIMITESCAMPOSC_1.set('fieldImages', {'Layer': 'TextEdit', 'PaperSpace': 'CheckBox', 'SubClasses': 'TextEdit', 'Linetype': 'TextEdit', 'EntityHandle': 'TextEdit', 'Text': 'TextEdit', });
lyr_LIMITESCAMPOSC_1.set('fieldLabels', {'Layer': 'no label', 'PaperSpace': 'no label', 'SubClasses': 'no label', 'Linetype': 'no label', 'EntityHandle': 'no label', 'Text': 'no label', });
lyr_LIMITESCAMPOSC_1.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});
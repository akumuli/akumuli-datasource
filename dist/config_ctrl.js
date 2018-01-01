///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register([], function(exports_1) {
    var AkumuliConfigCtrl;
    return {
        setters:[],
        execute: function() {
            AkumuliConfigCtrl = (function () {
                /** @ngInject */
                function AkumuliConfigCtrl($scope) {
                    this.tsdbVersions = [
                        { name: '==0.7', value: 1 },
                    ];
                    this.current.jsonData = this.current.jsonData || {};
                    this.current.jsonData.tsdbVersion = this.current.jsonData.tsdbVersion || 1;
                }
                //static templateUrl = 'public/plugins/akumuli-datasource/partials/config.html';
                AkumuliConfigCtrl.templateUrl = 'partials/config.html';
                return AkumuliConfigCtrl;
            })();
            exports_1("AkumuliConfigCtrl", AkumuliConfigCtrl);
        }
    }
});
//# sourceMappingURL=config_ctrl.js.map
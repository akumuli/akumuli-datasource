///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

export class AkumuliConfigCtrl {
  //static templateUrl = 'public/plugins/akumuli-datasource/partials/config.html';
  static templateUrl = 'partials/config.html';
  current: any;

  /** @ngInject */
  constructor($scope) {
    this.current.jsonData = this.current.jsonData || {};
    this.current.jsonData.tsdbVersion = this.current.jsonData.tsdbVersion || 1;
  }

  tsdbVersions = [
    {name: '==0.7', value: 1},
  ];

}

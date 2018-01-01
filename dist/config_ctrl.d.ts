/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
export declare class AkumuliConfigCtrl {
    static templateUrl: string;
    current: any;
    /** @ngInject */
    constructor($scope: any);
    tsdbVersions: {
        name: string;
        value: number;
    }[];
}

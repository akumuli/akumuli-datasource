/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { QueryCtrl } from 'app/plugins/sdk';
export declare class AkumuliQueryCtrl extends QueryCtrl {
    static templateUrl: string;
    aggregators: any;
    fillPolicies: any;
    filterTypes: any;
    tsdbVersion: any;
    aggregator: any;
    downsampleInterval: any;
    downsampleAggregator: any;
    downsampleFillPolicy: any;
    errors: any;
    suggestMetrics: any;
    suggestTagKeys: any;
    suggestTagValues: any;
    suggestAlias: any;
    addTagMode: boolean;
    addFilterMode: boolean;
    /** @ngInject **/
    constructor($scope: any, $injector: any);
    targetBlur(): void;
    getTextValues(metricFindResult: any): any;
    addTag(): void;
    removeTag(key: any): void;
    editTag(key: any, value: any): void;
    closeAddTagMode(): void;
    validateTarget(): any;
}

///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['lodash', 'app/core/utils/kbn', './css/query_editor.css!', 'app/plugins/sdk'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var lodash_1, kbn_1, sdk_1;
    var AkumuliQueryCtrl;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (kbn_1_1) {
                kbn_1 = kbn_1_1;
            },
            function (_1) {},
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            }],
        execute: function() {
            AkumuliQueryCtrl = (function (_super) {
                __extends(AkumuliQueryCtrl, _super);
                /** @ngInject **/
                function AkumuliQueryCtrl($scope, $injector) {
                    var _this = this;
                    _super.call(this, $scope, $injector);
                    this.errors = this.validateTarget();
                    this.aggregators = ['sum', 'min', 'max', 'mean', 'count'];
                    this.fillPolicies = ['none', 'nan', 'null', 'zero'];
                    this.filterTypes = ['wildcard', 'iliteral_or', 'not_iliteral_or', 'not_literal_or', 'iwildcard', 'literal_or', 'regexp'];
                    this.tsdbVersion = this.datasource.tsdbVersion;
                    if (!this.target.aggregator) {
                        this.target.aggregator = 'sum';
                    }
                    if (!this.target.downsampleAggregator) {
                        this.target.downsampleAggregator = 'mean';
                    }
                    if (!this.target.downsampleFillPolicy) {
                        this.target.downsampleFillPolicy = 'none';
                    }
                    this.datasource.getAggregators().then(function (aggs) {
                        if (aggs.length !== 0) {
                            _this.aggregators = aggs;
                        }
                    });
                    // needs to be defined here as it is called from typeahead
                    this.suggestMetrics = function (query, callback) {
                        _this.datasource.suggestMetricNames(query)
                            .then(_this.getTextValues)
                            .then(callback);
                    };
                    this.suggestAlias = function (query, callback) {
                        _this.datasource.suggestAlias(_this.target.metric, _this.target.alias)
                            .then(_this.getTextValues)
                            .then(callback);
                    };
                    this.suggestTagKeys = function (query, callback) {
                        _this.datasource.suggestTagKeys(_this.target.metric, _this.target.currentTagKey)
                            .then(_this.getTextValues)
                            .then(callback);
                    };
                    this.suggestTagValues = function (query, callback) {
                        _this.datasource.suggestTagValues(_this.target.metric, _this.target.currentTagKey, _this.target.currentTagValue, true)
                            .then(_this.getTextValues)
                            .then(callback);
                    };
                }
                AkumuliQueryCtrl.prototype.targetBlur = function () {
                    this.errors = this.validateTarget();
                    this.refresh();
                };
                AkumuliQueryCtrl.prototype.getTextValues = function (metricFindResult) {
                    return lodash_1.default.map(metricFindResult, function (value) { return value.text; });
                };
                AkumuliQueryCtrl.prototype.addTag = function () {
                    if (this.target.filters && this.target.filters.length > 0) {
                        this.errors.tags = "Please remove filters to use tags, tags and filters are mutually exclusive.";
                    }
                    if (!this.addTagMode) {
                        this.addTagMode = true;
                        return;
                    }
                    if (!this.target.tags) {
                        this.target.tags = {};
                    }
                    this.errors = this.validateTarget();
                    if (!this.errors.tags) {
                        this.target.tags[this.target.currentTagKey] = this.target.currentTagValue;
                        this.target.currentTagKey = '';
                        this.target.currentTagValue = '';
                        this.targetBlur();
                    }
                    this.addTagMode = false;
                };
                AkumuliQueryCtrl.prototype.removeTag = function (key) {
                    delete this.target.tags[key];
                    this.targetBlur();
                };
                AkumuliQueryCtrl.prototype.editTag = function (key, value) {
                    this.removeTag(key);
                    this.target.currentTagKey = key;
                    this.target.currentTagValue = value;
                    this.addTag();
                };
                AkumuliQueryCtrl.prototype.closeAddTagMode = function () {
                    this.addTagMode = false;
                    return;
                };
                AkumuliQueryCtrl.prototype.validateTarget = function () {
                    var errs = {};
                    if (this.target.shouldDownsample) {
                        try {
                            if (this.target.downsampleInterval) {
                                kbn_1.default.describe_interval(this.target.downsampleInterval);
                            }
                            else {
                                errs.downsampleInterval = "You must supply a downsample interval (e.g. '1m' or '1h').";
                            }
                        }
                        catch (err) {
                            errs.downsampleInterval = err.message;
                        }
                    }
                    if (this.target.tags && lodash_1.default.has(this.target.tags, this.target.currentTagKey)) {
                        errs.tags = "Duplicate tag key '" + this.target.currentTagKey + "'.";
                    }
                    return errs;
                };
                AkumuliQueryCtrl.templateUrl = 'partials/query.editor.html';
                return AkumuliQueryCtrl;
            })(sdk_1.QueryCtrl);
            exports_1("AkumuliQueryCtrl", AkumuliQueryCtrl);
        }
    }
});
//# sourceMappingURL=query_ctrl.js.map
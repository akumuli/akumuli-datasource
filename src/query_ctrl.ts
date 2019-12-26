///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import './css/query_editor.css!';
import {QueryCtrl} from 'app/plugins/sdk';

export class AkumuliQueryCtrl extends QueryCtrl {
  static templateUrl = 'partials/query.editor.html';
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
  addPivotTagMode: boolean;
  addGroupTagMode: boolean;
  addFilterMode: boolean;

  /** @ngInject **/
  constructor($scope, $injector) {
    super($scope, $injector);

    this.errors = this.validateTarget();
    this.aggregators = ['sum', 'min', 'max', 'mean', 'count'];
    this.fillPolicies = ['none', 'nan', 'null', 'zero'];
    this.filterTypes = ['wildcard','iliteral_or','not_iliteral_or','not_literal_or','iwildcard','literal_or','regexp'];

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

    this.datasource.getAggregators().then((aggs) => {
      if (aggs.length !== 0) {
        this.aggregators = aggs;
      }
    });

    // needs to be defined here as it is called from typeahead
    this.suggestMetrics = (query, callback) => {
      this.datasource.suggestMetricNames(query)
      .then(this.getTextValues)
      .then(callback);
    };

    this.suggestAlias = (query, callback) => {
      this.datasource.suggestAlias(this.target.metric, this.target.alias)
      .then(this.getTextValues)
      .then(callback);
    };

    this.suggestTagKeys = (query, callback) => {
      this.datasource.suggestTagKeys(this.target.metric, this.target.currentTagKey)
      .then(this.getTextValues)
      .then(callback);
    };

    this.suggestTagValues = (query, callback) => {
      this.datasource.suggestTagValues(this.target.metric, this.target.currentTagKey, this.target.currentTagValue, true)
      .then(this.getTextValues)
      .then(callback);
    };
  }

  targetBlur() {
    this.errors = this.validateTarget();
    this.refresh();
  }

  getTextValues(metricFindResult) {
    return _.map(metricFindResult, function(value) { return value.text; });
  }

  addTag() {

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
  }

  removeTag(key) {
    delete this.target.tags[key];
    this.targetBlur();
  }

  editTag(key, value) {
    this.removeTag(key);
    this.target.currentTagKey = key;
    this.target.currentTagValue = value;
    this.addTag();
  }

  closeAddTagMode() {
    this.addTagMode = false;
    return;
  }

  addPivotTag() {

    if (!this.addPivotTagMode) {
      this.addPivotTagMode = true;
      return;
    }

    if (!this.target.pivotTags) {
      this.target.pivotTags = [];
    }

    this.errors = this.validateTarget();

    if (!this.errors.tags) {
      this.target.pivotTags.push(this.target.currentPivotTagKey);
      this.target.currentPivotTagKey = '';
      this.targetBlur();
    }

    this.addPivotTagMode = false;
  }

  removePivotTag(key) {
    this.target.pivotTags = this.target.pivotTags.filter(item => item !== key);
    this.targetBlur();
  }

  editPivotTag(key) {
    this.removePivotTag(key);
    this.target.currentPivotTagKey = key;
    this.addPivotTag();
  }

  closeAddPivotTagMode() {
    this.addPivotTagMode = false;
    return;
  }

  addGroupTag() {

    if (!this.addGroupTagMode) {
      this.addGroupTagMode = true;
      return;
    }

    if (!this.target.groupTags) {
      this.target.groupTags = [];
    }

    this.errors = this.validateTarget();

    if (!this.errors.tags) {
      this.target.groupTags.push(this.target.currentGroupTagKey);
      this.target.currentGroupTagKey = '';
      this.targetBlur();
    }

    this.addGroupTagMode = false;
  }

  removeGroupTag(key) {
    this.target.groupTags = this.target.groupTags.filter(item => item !== key);
    this.targetBlur();
  }

  editGroupTag(key) {
    this.removeGroupTag(key);
    this.target.currentGroupTagKey = key;
    this.addGroupTag();
  }

  closeAddGroupTagMode() {
    this.addGroupTagMode = false;
    return;
  }

  validateTarget() {
    var errs: any = {};

    if (this.target.shouldDownsample) {
      try {
        if (this.target.downsampleInterval) {
          kbn.describe_interval(this.target.downsampleInterval);
        } else {
          errs.downsampleInterval = "You must supply a downsample interval (e.g. '1m' or '1h').";
        }
      } catch (err) {
        errs.downsampleInterval = err.message;
      }
    }

    if (this.target.tags && _.has(this.target.tags, this.target.currentTagKey)) {
      errs.tags = "Duplicate tag key '" + this.target.currentTagKey + "'.";
    }

    if (this.target.pivotTags && _.has(this.target.pivotTags, this.target.currentPivotTagKey)) {
      errs.tags = "Duplicate tag key '" + this.target.currentPivotTagKey + "'.";
    }

    if (this.target.groupTags && _.has(this.target.groupTags, this.target.currentGroupTagKey)) {
      errs.tags = "Duplicate tag key '" + this.target.currentGroupTagKey + "'.";
    }

    return errs;
  }
}

///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['lodash', "moment"], function(exports_1) {
    var lodash_1, moment_1;
    var AkumuliDatasource;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (moment_1_1) {
                moment_1 = moment_1_1;
            }],
        execute: function() {
            AkumuliDatasource = (function () {
                /** @ngInject */
                function AkumuliDatasource(instanceSettings, backendSrv, templateSrv, $q) {
                    this.instanceSettings = instanceSettings;
                    this.backendSrv = backendSrv;
                    this.templateSrv = templateSrv;
                    this.$q = $q;
                    this.templateSrv.formatValue = this.formatTagValue;
                    this.limitMultiplyer = 10;
                }
                /** Test that datasource connection works */
                AkumuliDatasource.prototype.testDatasource = function () {
                    var options = {
                        method: "GET",
                        url: this.instanceSettings.url + "/api/stats",
                        data: ""
                    };
                    return this.backendSrv.datasourceRequest(options).then(function (res) {
                        return { status: "success", message: "Data source is working", title: "Success" };
                    });
                };
                AkumuliDatasource.prototype.metricFindQuery = function (queryString) {
                    var components = queryString.split(" ");
                    var len = components.length;
                    if (len === 0) {
                        // query metric names
                        return this.suggestMetricNames("");
                    }
                    else if (len === 1) {
                        // query tag names
                        return this.suggestTagKeys(components[0], "");
                    }
                    else if (len === 2) {
                        // query tag values
                        return this.suggestTagValues(components[0], components[1], "", false);
                    }
                    throw { message: "Invalid query string (up too three components can be used)" };
                };
                AkumuliDatasource.prototype.suggestAlias = function (metric, query) {
                    query = query || "";
                    var ix = query.lastIndexOf("$");
                    var fixed;
                    var variable;
                    if (query.endsWith(" ")) {
                        fixed = query + "$";
                        variable = "";
                    }
                    else if (ix >= 0) {
                        fixed = query.substr(0, ix + 1);
                        variable = query.substr(ix + 1);
                    }
                    else {
                        fixed = "$";
                        variable = query;
                    }
                    return this.suggestTagKeys(metric, variable).then(function (res) {
                        var data = [];
                        lodash_1.default.forEach(res, function (dot) {
                            if (dot) {
                                var name = fixed + dot.text;
                                data.push({ text: name, value: name });
                            }
                        });
                        return data;
                    });
                };
                AkumuliDatasource.prototype.suggestMetricNames = function (metricName) {
                    var requestBody = {
                        select: "metric-names",
                        "starts-with": metricName
                    };
                    var httpRequest = {
                        method: "POST",
                        url: this.instanceSettings.url + "/api/suggest",
                        data: requestBody
                    };
                    return this.backendSrv.datasourceRequest(httpRequest).then(function (res) {
                        var data = [];
                        if (res.status === 'error') {
                            throw res.error;
                        }
                        if (res.data.charAt(0) === '-') {
                            throw { message: res.data.substr(1) };
                        }
                        var lines = res.data.split("\r\n");
                        lodash_1.default.forEach(lines, function (line) {
                            if (line) {
                                var name = line.substr(1);
                                data.push({ text: name, value: name });
                            }
                        });
                        return data;
                    });
                };
                /** Parse series name in a canonical form */
                AkumuliDatasource.prototype.extractTags = function (names) {
                    var where = [];
                    lodash_1.default.forEach(names, function (name) {
                        var tags = name.split(' ');
                        if (tags.length < 2) {
                            // This shouldn't happen since series name should
                            // contain a metric name and at least one tag.
                            throw "bad metric name received";
                        }
                        var tagset = {};
                        for (var i = 1; i < tags.length; i++) {
                            var kv = tags[i].split('=');
                            var tag = kv[0];
                            var value = kv[1];
                            tagset[tag] = value;
                        }
                        where.push(tagset);
                    });
                    return where;
                };
                // Convert series name into alias using the alias template
                AkumuliDatasource.prototype.convertSeriesName = function (template, name) {
                    // Parse the template
                    var dict = this.extractTags([name])[0];
                    var result = template;
                    for (var key in dict) {
                        var value = dict[key];
                        result = result.replace("$" + key, value);
                    }
                    return result;
                };
                AkumuliDatasource.prototype.annotationQuery = function (options) {
                    return this.backendSrv.get('/api/annotations', {
                        from: options.range.from.valueOf(),
                        to: options.range.to.valueOf(),
                        limit: options.limit,
                        type: options.type,
                    });
                };
                AkumuliDatasource.prototype.getAggregators = function () {
                    // TODO: query aggregators from Akumuli
                    return new Promise(function (resolve, reject) {
                        resolve(["mean", "sum", "count", "min", "max"]);
                    });
                };
                AkumuliDatasource.prototype.suggestTagKeys = function (metric, tagPrefix) {
                    tagPrefix = tagPrefix || "";
                    var requestBody = {
                        select: "tag-names",
                        metric: metric,
                        "starts-with": tagPrefix
                    };
                    var httpRequest = {
                        method: "POST",
                        url: this.instanceSettings.url + "/api/suggest",
                        data: requestBody
                    };
                    return this.backendSrv.datasourceRequest(httpRequest).then(function (res) {
                        var data = [];
                        if (res.status === 'error') {
                            throw res.error;
                        }
                        if (res.data.charAt(0) === '-') {
                            throw { message: res.data.substr(1) };
                        }
                        var lines = res.data.split("\r\n");
                        lodash_1.default.forEach(lines, function (line) {
                            if (line) {
                                var name = line.substr(1);
                                data.push({ text: name, value: name });
                            }
                        });
                        return data;
                    });
                };
                AkumuliDatasource.prototype.suggestTagValues = function (metric, tagName, valuePrefix, addTemplateVars) {
                    var _this = this;
                    // valuePrefix can be empty, can contain single token (complete or not) or it can have
                    // a list of values with incomplete last token (e.g tagName="direction" valuePrefix="in ou"
                    // should return autocomplete for "ou" wich will be "out").
                    valuePrefix = valuePrefix || "";
                    var ix = valuePrefix.lastIndexOf(" ");
                    var fixed;
                    var variable;
                    if (ix >= 0) {
                        fixed = valuePrefix.substr(0, ix + 1);
                        variable = valuePrefix.substr(ix + 1);
                    }
                    else {
                        fixed = "";
                        variable = valuePrefix;
                    }
                    tagName = tagName || "";
                    var requestBody = {
                        select: "tag-values",
                        metric: metric,
                        tag: tagName,
                        "starts-with": variable
                    };
                    var httpRequest = {
                        method: "POST",
                        url: this.instanceSettings.url + "/api/suggest",
                        data: requestBody
                    };
                    return this.backendSrv.datasourceRequest(httpRequest).then(function (res) {
                        var data = [];
                        if (res.status === 'error') {
                            throw res.error;
                        }
                        if (res.data.charAt(0) === '-') {
                            throw { message: res.data.substr(1) };
                        }
                        var lines = res.data.split("\r\n");
                        lodash_1.default.forEach(lines, function (line) {
                            if (line) {
                                var name = fixed + line.substr(1);
                                data.push({ text: name, value: name });
                            }
                        });
                        // Include template variables (if any)
                        if (addTemplateVars) {
                            lodash_1.default.forEach(_this.templateSrv.variables, function (variable) {
                                if (variable.type === "query") {
                                    var template = fixed + "$" + variable.name;
                                    data.push({ text: template, value: template });
                                }
                            });
                        }
                        return data;
                    });
                };
                AkumuliDatasource.prototype.formatTagValue = function (value) {
                    if (typeof value === 'string') {
                        return value;
                    }
                    return value.join(" ");
                };
                AkumuliDatasource.prototype.preprocessTags = function (target) {
                    var _this = this;
                    var tags = {};
                    if (target.tags) {
                        lodash_1.default.forEach(Object.keys(target.tags), function (key) {
                            var value = target.tags[key];
                            value = _this.templateSrv.replace(value);
                            if (value.lastIndexOf(" ") > 0) {
                                var lst = value.split(" ");
                                var outlst = [];
                                lodash_1.default.forEach(lst, function (token) {
                                    if (token.length !== 0) {
                                        outlst.push(token.trim());
                                    }
                                });
                                tags[key] = outlst;
                            }
                            else {
                                tags[key] = value;
                            }
                        });
                    }
                    return tags;
                };
                /** Query time-series storage */
                AkumuliDatasource.prototype.groupAggregateTopNQuery = function (begin, end, interval, limit, target) {
                    var _this = this;
                    // Use all the same parametres as original query
                    // but add 'top' function to the 'apply' clause.
                    // Extract tags from results and run 'select' query
                    // nomrally.
                    var metricName = target.metric;
                    var tags = this.preprocessTags(target);
                    var isTop = target.topN ? true : false;
                    var topN = target.topN;
                    if (!isTop) {
                        throw "top-N parameter required";
                    }
                    var query = {
                        select: metricName,
                        range: {
                            from: begin.format('YYYYMMDDTHHmmss.SSS'),
                            to: end.format('YYYYMMDDTHHmmss.SSS')
                        },
                        where: tags,
                        "order-by": "series",
                        apply: [{ name: "top", N: topN }],
                        limit: limit
                    };
                    var httpRequest = {
                        method: "POST",
                        url: this.instanceSettings.url + "/api/query",
                        data: query
                    };
                    return this.backendSrv.datasourceRequest(httpRequest).then(function (res) {
                        if (res.status === 'error') {
                            throw res.error;
                        }
                        if (res.data.charAt(0) === '-') {
                            throw { message: "Query error: " + res.data.substr(1) };
                        }
                        var lines = res.data.split("\r\n");
                        var index = 0;
                        var series = null;
                        var series_names = [];
                        lodash_1.default.forEach(lines, function (line) {
                            var step = index % 3;
                            if (step === 0) {
                                // parse series name
                                series = line.substr(1);
                                if (series) {
                                    series_names.push(series);
                                }
                            }
                            index++;
                        });
                        var newTarget = {
                            metric: metricName,
                            tags: _this.extractTags(series_names),
                            shouldComputeRate: target.shouldComputeRate,
                            shouldEWMA: target.shouldEWMA,
                            decay: target.decay,
                            downsampleAggregator: target.downsampleAggregator,
                            downsampleInterval: target.downsampleInterval,
                        };
                        return _this.groupAggregateTargetQuery(begin, end, interval, limit, newTarget);
                    });
                };
                /** Query time-series storage */
                AkumuliDatasource.prototype.groupAggregateTargetQuery = function (begin, end, interval, limit, target) {
                    var _this = this;
                    var metricName = target.metric;
                    var tags = {};
                    if (target.tags) {
                        if (target.tags instanceof Array) {
                            // Special case, TopN query is processed
                            tags = target.tags;
                        }
                        else {
                            tags = this.preprocessTags(target);
                        }
                    }
                    var alias = target.alias;
                    var aggFunc = target.downsampleAggregator;
                    var rate = target.shouldComputeRate;
                    var ewma = target.shouldEWMA;
                    var decay = target.decay || 0.5;
                    var samplingInterval = this.templateSrv.replace(target.downsampleInterval || interval);
                    var query = {
                        "group-aggregate": {
                            metric: metricName,
                            step: samplingInterval,
                            func: [aggFunc]
                        },
                        range: {
                            from: begin.format('YYYYMMDDTHHmmss.SSS'),
                            to: end.format('YYYYMMDDTHHmmss.SSS')
                        },
                        where: tags,
                        "order-by": "series",
                        apply: [],
                        limit: limit
                    };
                    if (rate) {
                        query["apply"].push({ name: "rate" });
                    }
                    if (ewma) {
                        query["apply"].push({ name: "ewma", decay: decay });
                    }
                    var httpRequest = {
                        method: "POST",
                        url: this.instanceSettings.url + "/api/query",
                        data: query,
                    };
                    // Read the actual data and process it
                    return this.backendSrv.datasourceRequest(httpRequest).then(function (res) {
                        var data = [];
                        if (res.status === 'error') {
                            throw res.error;
                        }
                        if (res.data.charAt(0) === '-') {
                            throw { message: res.data.substr(1) };
                        }
                        var lines = res.data.split("\r\n");
                        var index = 0;
                        var series = null;
                        var timestamp = null;
                        var value = 0.0;
                        var datapoints = [];
                        var currentTarget = null;
                        lodash_1.default.forEach(lines, function (line) {
                            var step = index % 4;
                            switch (step) {
                                case 0:
                                    // parse series name
                                    series = line.replace(/(\S*)(:mean)(.*)/g, "$1$3").substr(1);
                                    break;
                                case 1:
                                    // parse timestamp
                                    timestamp = moment_1.default.utc(line.substr(1)).local();
                                    break;
                                case 2:
                                    break;
                                case 3:
                                    value = parseFloat(line.substr(1));
                                    break;
                            }
                            if (step === 3) {
                                if (currentTarget == null) {
                                    currentTarget = series;
                                }
                                if (currentTarget === series) {
                                    datapoints.push([value, timestamp]);
                                }
                                else {
                                    data.push({
                                        target: currentTarget,
                                        datapoints: datapoints
                                    });
                                    datapoints = [[value, timestamp]];
                                    currentTarget = series;
                                }
                            }
                            index++;
                        });
                        if (datapoints.length !== 0) {
                            data.push({
                                target: currentTarget,
                                datapoints: datapoints
                            });
                        }
                        if (alias) {
                            for (var i = 0; i < data.length; i++) {
                                data[i].target = _this.convertSeriesName(alias, data[i].target);
                            }
                        }
                        return data;
                    });
                };
                /** Query time-series storage */
                AkumuliDatasource.prototype.selectTopNQuery = function (begin, end, limit, target) {
                    var _this = this;
                    // Use all the same parametres as original query
                    // but add 'top' function to the 'apply' clause.
                    // Extract tags from results and run 'select' query
                    // nomrally.
                    var metricName = target.metric;
                    var tags = this.preprocessTags(target);
                    var isTop = target.topN ? true : false;
                    var topN = target.topN;
                    if (!isTop) {
                        throw "top-N parameter required";
                    }
                    var query = {
                        "select": metricName,
                        range: {
                            from: begin.format('YYYYMMDDTHHmmss.SSS'),
                            to: end.format('YYYYMMDDTHHmmss.SSS')
                        },
                        where: tags,
                        "order-by": "series",
                        apply: [{ name: "top", N: topN }],
                        limit: limit
                    };
                    var httpRequest = {
                        method: "POST",
                        url: this.instanceSettings.url + "/api/query",
                        data: query
                    };
                    return this.backendSrv.datasourceRequest(httpRequest).then(function (res) {
                        if (res.status === 'error') {
                            throw res.error;
                        }
                        if (res.data.charAt(0) === '-') {
                            throw { message: "Query error: " + res.data.substr(1) };
                        }
                        var lines = res.data.split("\r\n");
                        var index = 0;
                        var series = null;
                        var series_names = [];
                        lodash_1.default.forEach(lines, function (line) {
                            var step = index % 3;
                            if (step === 0) {
                                // parse series name
                                series = line.substr(1);
                                if (series) {
                                    series_names.push(series);
                                }
                            }
                            index++;
                        });
                        var newTarget = {
                            metric: metricName,
                            tags: _this.extractTags(series_names),
                            shouldComputeRate: target.shouldComputeRate,
                            shouldEWMA: target.shouldEWMA,
                            decay: target.decay,
                        };
                        return _this.selectTargetQuery(begin, end, limit, newTarget);
                    });
                };
                /** Query time-series storage */
                AkumuliDatasource.prototype.selectTargetQuery = function (begin, end, limit, target) {
                    var _this = this;
                    var metricName = target.metric;
                    var tags = {};
                    if (target.tags) {
                        if (target.tags instanceof Array) {
                            // Special case, TopN query is processed
                            tags = target.tags;
                        }
                        else {
                            tags = this.preprocessTags(target);
                        }
                    }
                    var alias = target.alias;
                    var rate = target.shouldComputeRate;
                    var ewma = target.shouldEWMA;
                    var decay = target.decay || 0.5;
                    var query = {
                        "select": metricName,
                        range: {
                            from: begin.format('YYYYMMDDTHHmmss.SSS'),
                            to: end.format('YYYYMMDDTHHmmss.SSS')
                        },
                        where: tags,
                        "order-by": "series",
                        apply: [],
                        limit: limit,
                    };
                    if (rate) {
                        query["apply"].push({ name: "rate" });
                    }
                    if (ewma) {
                        query["apply"].push({ name: "ewma", decay: decay });
                    }
                    var httpRequest = {
                        method: "POST",
                        url: this.instanceSettings.url + "/api/query",
                        data: query
                    };
                    return this.backendSrv.datasourceRequest(httpRequest).then(function (res) {
                        var data = [];
                        if (res.status === 'error') {
                            throw res.error;
                        }
                        if (res.data.charAt(0) === '-') {
                            throw { message: "Query error: " + res.data.substr(1) };
                        }
                        var lines = res.data.split("\r\n");
                        var index = 0;
                        var series = null;
                        var timestamp = null;
                        var value = 0.0;
                        var datapoints = [];
                        var currentTarget = null;
                        lodash_1.default.forEach(lines, function (line) {
                            var step = index % 3;
                            switch (step) {
                                case 0:
                                    // parse series name
                                    series = line.substr(1);
                                    break;
                                case 1:
                                    // parse timestamp
                                    timestamp = moment_1.default.utc(line.substr(1)).local();
                                    break;
                                case 2:
                                    value = parseFloat(line.substr(1));
                                    break;
                            }
                            if (step === 2) {
                                if (currentTarget == null) {
                                    currentTarget = series;
                                }
                                if (currentTarget === series) {
                                    datapoints.push([value, timestamp]);
                                }
                                else {
                                    data.push({
                                        target: currentTarget,
                                        datapoints: datapoints
                                    });
                                    datapoints = [[value, timestamp]];
                                    currentTarget = series;
                                }
                            }
                            index++;
                        });
                        if (datapoints.length !== 0) {
                            data.push({
                                target: currentTarget,
                                datapoints: datapoints
                            });
                        }
                        if (alias) {
                            for (var i = 0; i < data.length; i++) {
                                data[i].target = _this.convertSeriesName(alias, data[i].target);
                            }
                        }
                        return data;
                    });
                };
                AkumuliDatasource.prototype.query = function (options) {
                    var _this = this;
                    var begin = options.range.from.utc();
                    var end = options.range.to.utc();
                    var interval = options.interval;
                    // This is a safety measure against overload of the browser. Akumuli can return more than one
                    // Series for a single plot. Grafana's maxDataPoints value is not adequate as a limit value
                    // because it's calculated for a single series and this plugin can't know in advance how many
                    // series the query will return. So, the limit is set to some arbitrary high value (1M) that
                    // wouldn't be exceded by any query, but at the same time, browser will be able to parse that
                    // many data-points without hanging or crashing.
                    var limit = 1000000;
                    var allQueryPromise = lodash_1.default.map(options.targets, function (target) {
                        if (target.hide === true) {
                            return new Promise(function (resolve, reject) {
                                resolve([]);
                            });
                        }
                        var disableDownsampling = target.disableDownsampling;
                        var isTop = target.topN ? true : false;
                        if (disableDownsampling) {
                            if (isTop) {
                                return _this.selectTopNQuery(begin, end, limit, target);
                            }
                            else {
                                return _this.selectTargetQuery(begin, end, limit, target);
                            }
                        }
                        else {
                            if (isTop) {
                                return _this.groupAggregateTopNQuery(begin, end, interval, limit, target);
                            }
                            else {
                                return _this.groupAggregateTargetQuery(begin, end, interval, limit, target);
                            }
                        }
                    });
                    return this.$q.all(allQueryPromise).then(function (allResults) {
                        var data = [];
                        lodash_1.default.forEach(allResults, function (result, index) {
                            data = data.concat(result);
                        });
                        return { data: data };
                    });
                };
                return AkumuliDatasource;
            })();
            exports_1("AkumuliDatasource", AkumuliDatasource);
        }
    }
});
//# sourceMappingURL=datasource.js.map
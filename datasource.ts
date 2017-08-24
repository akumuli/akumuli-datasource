///<reference path="../../../headers/common.d.ts" />

import _ from 'lodash';
import moment from "moment";

class AkumuliDatasource {

  /** @ngInject */
  constructor(private instanceSettings, private backendSrv, private $q) {}

  query(options) {
    console.log("Query:");
    console.log(options.targets);
    console.log(options.maxDataPoints);
    console.log(options.interval);
    console.log("-----");
    return this.timeSeriesQuery(options).then(res => {
      var data = [];
      var lines = res.data.split("\r\n");
      var index = 0;
      var series = null;
      var timestamp = null;
      var value = 0.0;
      var datapoints = [];
      var currentTarget = null;
      _.forEach(lines, line => {
        let step = index % 4;
        switch (step) {
          case 0:
            // parse series name
            series = line.replace(/(\S*)(:mean)(.*)/g, "$1$3").substr(1);
            break;
          case 1:
            // parse timestamp
            timestamp = moment.utc(line.substr(1)).local();
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
          } else {
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
      return { data: data };
    });
  }

  /** Test that datasource connection works */
  testDatasource() {
    var options: any = {
      method: "GET",
      url: this.instanceSettings.url + "/api/stats",
      data: ""
    };
    return this.backendSrv.datasourceRequest(options).then(res => {
      return { status: "success", message: "Data source is working", title: "Success" };
    });
  }

  metricFindQuery(options) {
    console.log(options);
    return this.$q.when({data: []});
  }

  annotationQuery(options) {
    return this.backendSrv.get('/api/annotations', {
      from: options.range.from.valueOf(),
      to: options.range.to.valueOf(),
      limit: options.limit,
      type: options.type,
    });
  }

  /** Query time-series storage */
  timeSeriesQuery(options) {
    var begin    = options.range.from.utc();
    var end      = options.range.to.utc();
    var interval = options.interval;
    var limit    = options.maxDataPoints;
    console.log('timeSeriesQuery: ' + begin.format('YYYYMMDDThhmmss.SSS')
                                    +   end.format('YYYYMMDDThhmmss.SSS'));
    var requestBody: any = {
      "group-aggregate": {
        metric: "net.stat.tcp.retransmit",
        step: interval,
        func: [ "mean" ]
      },
      range: {
        from: begin.format('YYYYMMDDThhmmss.SSS'),
        to: end.format('YYYYMMDDThhmmss.SSS')
      },
      where: {
        host: "SW-0044"
      },
      //limit: limit,
      "order-by": "series"
    };

    var options: any = {
      method: "POST",
      url: this.instanceSettings.url + "/api/query",
      data: requestBody
    };

    return this.backendSrv.datasourceRequest(options);
  }
}

export {AkumuliDatasource};

///<reference path="../../../headers/common.d.ts" />

import _ from 'lodash';
import moment from "moment";

class AkumuliDatasource {

  /** @ngInject */
  constructor(private instanceSettings, private backendSrv, private $q) {}

  query(options) {
    return this.timeSeriesQuery(options.range.from, options.range.to).then(res => {
      var data = [];
      var lines = res.data.split("\r\n");
      var index = 0;
      var series = null;
      var timestamp = null;
      var value = 0.0;
      _.forEach(lines, line => {
        let step = index % 3;
        switch (step) {
          case 0:
            // parse series name
            series = line;
            break;
          case 1:
            // parse timestamp
            timestamp = moment(line);
            break;
          case 2:
            value = parseFloat(line);
            break;
        }
        if (step === 2) {
          console.log("Data point ready: ", series, ", ", timestamp.format(), ", ", value);
          // data.push ...
        }
        index++;
      });
      return { data: data };
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
  timeSeriesQuery(begin, end) {
    console.log('timeSeriesQuery: ' + begin.format('YYYYMMDDThhmmss.SSS')
                                    +   end.format('YYYYMMDDThhmmss.SSS'));
    var requestBody: any = {
      select: "proc.net.bytes",
      range: {
        from: begin.format('YYYYMMDDThhmmss.SSS'),
        to: end.format('YYYYMMDDThhmmss.SSS')
      },
      where: {
        iface: 'eth0'
      }
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

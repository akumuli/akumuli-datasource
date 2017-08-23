///<reference path="../../../headers/common.d.ts" />

import _ from 'lodash';

class AkumuliDatasource {

  /** @ngInject */
  constructor(private instanceSettings, private backendSrv, private $q) {}

  query(options) {
    return this.timeSeriesQuery(options.range.from, options.range.to).then(res => {
      var data = [];
      if (res.results) {
        _.forEach(res.results, queryRes => {
          console.log("Query res: " + queryRes);
          data.push({
            target: "seriesname",
            datapoints: []
          });
        });
      }
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

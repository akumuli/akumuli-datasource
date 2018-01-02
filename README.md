# Akumuli Grafana Datasource Plugin

This is a datasource plugin for Grafana that can be used to visualize data from the [Akumuli](https://github.com/akumuli/Akumuli) time-series database. 

![Grafana dashboard](/akumuli.grafana.png)

Supported features of the datasource:

- Native downsampling using one of the supported functions (avg, min, max, etc).
- Query data in the original form (without downampling).
- Rate calculation for counters.
- Simple anomaly detection using EWMA prediction (it's easy to set up and works great with Grafana's alerts).
- Top-N query support.
- Autocomplete for metric names, tag names and values for easier discovery.

Other Akumuli functions and aggregations will be added in the future.

## Set up

To install the plugin simply clone this repository to your Grafana's plugins directory. It's located at `{grafana}/data/plugins`.

This plugin is based on OpenTSDB datasource plugin.

## Templating

The datasource supports templating feature. The only supported variable type is "Query". The query format is the following: `<metric-name> <tag-name>`. For instance, if you want to fetch the list of hosts from the database and you have the metric name called `proc.net.bytes` and the host names are encoded using the `host` tag, you can careate the variable with name "HostName" and query string `proc.net.bytes host`. After that you can create a dashboard and use the name `$HostName` instead of the actual address.

## How to build

The repository already contains /dist directory with build artefacts so you don't need to build it. If you've made any changes to the source code you can re build it using the following commands:

- yarn install
- npm run build

This will fetch depnedencies and run the build script.

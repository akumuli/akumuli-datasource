# Akumuli Grafana Datasource Plugin

This is a datasource plugin for Grafana that can be used to visualize data from the [Akumuli](https://github.com/akumuli/Akumuli) time-series database. 

![Grafana dashboard](https://raw.githubusercontent.com/akumuli/akumuli-datasource/master/akumuli.grafana.png)

Supported features of the datasource:

- Native downsampling using one of the supported functions (avg, min, max, etc).
- Query data in the original form (without downsampling).
- Rate calculation for counters.
- Top-N query support.
- Autocomplete for metric names, tag names and values for easier discovery.
- Aliases for series names (with autocomplete).
- Templating support.

Other Akumuli functions and aggregations will be added in the future.

## Set up

To install the plugin simply clone this repository to your Grafana's plugins directory. It's located at `{grafana}/data/plugins`.

## Templating

The datasource supports templating feature. The only supported variable type is "Query". The query format is the following: `<metric-name> <tag-name>`. For instance, if you want to fetch the list of hosts from the database and you have the metric name called `proc.net.bytes` and the host names are encoded using the `host` tag, you can careate the variable with name "HostName" and query string `proc.net.bytes host`. After that you can create a dashboard and use the name `$HostName` instead of the actual address.

## How to build

The repository already contains /dist directory with build artefacts so you don't need to build it. If you've made any changes to the source code you can re build it using the following commands:

- yarn install
- npm run build

This will fetch depnedencies and run the build script.

This plugin is based on OpenTSDB datasource plugin.

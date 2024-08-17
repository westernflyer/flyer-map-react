# How to use

## General data flow:

Transducer -> NMEA 2000 -> gateway -> SignalK server -> MQTT broker -> client websocket

## MQTT

Install an MQTT broker:

    sudo apt install mosquitto
    # Not essential, but useful:
    sudo apt install mosquitto-clients

Edit the file `/etc/mosquitto/mosquitto.conf` and add the following lines

    listener 1883
    listener 8080
    protocol websockets
    allow_anonymous true

Port `1883` is used to publish to the broker, port `8080` is used to communicate with the websocket client in the
browser. If you are using a remote host, you may need to punch a hole through its firewall for ports `1883` and `8080`.

## SignalK

Install the SignalK server:

    npm install -g signalk-server

then start it either standalone

    signalk-server

or using demo data

    signalk-server --sample-n2k-data

### Install the MQTT plugin

The plugin must be installed from the configuration directory `~/.signalk`:

    cd ~/.signalk
    npm install signalk-mqtt-push

Then restart the SignalK server

### Configure the MQTT plugin

Next, you need to configure the MQTT plugin. There are two choices:

1. [Do it manually](#manually-configure-the-plugin)
2. [Copy a config file into place](#copy-a-config-file-into-place)

#### Manually configure the plugin

Figure out which paths you want to watch. You can discover available data streams under the "Data Browser" tab. For
example, `navigation.position` and `environment.depth.belowTransducer` would give location and depth (below transducer),
respectively.

Then configure the plugin in the signalk admin webpage, nominally http://localhost:3000/ to watch those paths and
publish any changes to the broker. Look under "Server", then "Plugin Config", then "Signal K - MQTT Push". Add any
interested paths. You can also set how often they get published.

Example:

| SignalK path                        | Refresh rate |
|:------------------------------------|-------------:|
| `navigation.position`               |           20 |
| `navigation.speedOverGround`        |           20 | 
| `navigation.courseOverGroundTrue`   |           20 |      
| `navigation.speedThroughWater`      |           20 |
| `navigation.headingTrue`            |           20 |
| `environment.depth.belowTransducer` |           20 |     
| `environment.depth.belowKeel`       |           20 |           
| `environment.wind.speedApparent`    |           20 |
| `environment.wind.angleApparent`    |           20 |
| `environment.water.temperature`     |           10 |      

Double check that the topics are getting published:

    mosquitto_sub -h localhost -t '#'

The `-t '#'` says that you want to listen to all topics.

#### Copy a config file into place

Replace the file `~/.signalk/plugin-config-data/signalk-mqtt-push.json` with the copy found in this git repository.
The double check it to see if it looks reasonable for your environment. In particular, you will probably want to
change option `remoteHost`.

Restart the SignalK server.

Then double check that the topics are getting published:

    mosquitto_sub -h localhost -t '#'

The `-t '#'` says that you want to listen to all topics.




# How to use

## General data flow:

Transducer -> NMEA 2000 -> gateway -> SignalK server -> MQTT broker -> client websocket

What follows are specific instructions for each point along the way.

## NMEA 2000 and gateway

The Flyer map expects data on an NMEA 2000 network. It also expects there to be
a gateway between the network and a more traditional IP-oriented network. A good
choice to do this is the
[YDEN-02](https://yachtdevicesus.com/products/nmea-2000-ethernet-gateway-yden-02)
from Yacht Devices. Plug it into the NMEA 2000 network, then run an ethernet
cable between it and the LAN router. From there, the SignalK server can pick it
up.

## SignalK

1. Install the SignalK server:

        npm install -g signalk-server

    then start it either standalone

        signalk-server

    or using demo data

        signalk-server --sample-n2k-data

2. Browse to `http://localhost:3000`. Go to `Settings` (along the left hand
   side). Fill in as appropriate. In particular, supply a value for MMSI. This
   will be used to mark the published topics to the MQTT broker.

### Install the MQTT plugin

1. The plugin must be installed from the configuration directory `~/.signalk`:

        cd ~/.signalk
        npm install signalk-mqtt-push

2. Then restart the SignalK server

### Configure the MQTT plugin

Next, you need to configure the MQTT plugin. There are two choices:

1. [Do it manually](#manually-configure-the-plugin)
2. [Copy a config file into place](#copy-a-config-file-into-place)

#### Manually configure the plugin

1. Figure out which paths you want to watch. You can discover available data
streams under the "Data Browser" tab. For example, `navigation.position` and
`environment.depth.belowTransducer` would give location and depth (below
transducer), respectively.

2. Then configure the plugin in the signalk admin webpage, nominally
http://localhost:3000/, to watch those paths and publish any changes to the
broker. Look under "Server", then "Plugin Config", then "Signal K - MQTT Push".
Add any interested paths. You can also set how often they get published.

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
    | `environment.wind.speedTrue`        |           20 |
    | `environment.wind.directionTrue`    |           20 |
    | `environment.wind.speedApparent`    |           20 |
    | `environment.wind.angleApparent`    |           20 |
    | `environment.water.temperature`     |          120 |      
    
3. Double check that the topics are getting published:
    
        mosquitto_sub -h localhost -t '#'
    
    The `-t '#'` says that you want to listen to all topics.

#### Copy a config file into place

1. The alternative approach is to simply replace the file
`~/.signalk/plugin-config-data/signalk-mqtt-push.json` with the copy found in
this git repository. Then double check to see if it looks reasonable for your
environment. In particular, you will probably want to change option
`remoteHost`.

2. Restart the SignalK server.

3. Then double check that the topics are getting published:

        mosquitto_sub -h localhost -t '#'

    The `-t '#'` says that you want to listen to all topics.

## MQTT

An MQTT broker is used to act as a liaison between the boat and any client
browsers. The MQTT protocol takes minimal bandwidth, so it is excellent for
acting over a satellite or cellular connection. It should be installed on the
same server as the webserver.

1. To install an MQTT broker:

    ```
    sudo apt install mosquitto
    # Not essential, but useful:
    sudo apt install mosquitto-clients
    ```

2. Edit the file `/etc/mosquitto/mosquitto.conf` and add the following lines

    ```
    # For an unsecure MQTT connection
    listener 1883
    
    # For an unsecure MQTT connection over websockets:
    listener 8080
    protocol websockets
    allow_anonymous true
    
    # For a secure MQTT connection over websockets:
    listener 9001
    protocol websockets
    allow_anonymous true
    cafile /etc/mosquitto/certs/fullchain.pem
    certfile /etc/mosquitto/certs/cert.pem
    keyfile /etc/mosquitto/certs/privkey.pem
    ```

    If you are using Let's Encrypt, symbolic links for the three certificates can be
    found in `/etc/letsencrypt/live/yourdomain.com`. Unfortunately, Let's Encrypt
    refreshes them every 2 months, so you need to rotate new ones into place after
    every refresh. The script `mosquitto-copy.sh` in the directory `letsencrypt` can
    do this for you. Put it in the directory
    `/etc/letsencrypt/renewal-hooks/deploy`. Be sure to change the variable
    `MY_DOMAIN` to reflect your domain.

3. One final step, if you are using a remote host, you may need to punch a hole
through its firewall for ports `1883` and `8080`, and `9001`.

## The client

Finally, we come to the client!

1. Edit the configuration file `./flyer.config.js`. In particular, set an appropriate
value for `brokerUrl` and for `vesselId`. The vessel's MMSI number is usually
used for the latter.

### Google maps

1. The system uses Google Maps, which requires an API key. After obtaining one from
the [credentials](https://console.cloud.google.com/google/maps-apis/credentials)
page, restrict the access to your key to the website you need. Here's what I
used:

    <img src="./images/website_restrictions.png" alt="Be sure to specify the trailing slash!">
    
    Be sure to specify the trailing slash after `flyer-map`!
    
    You can also restrict which APIs to use. You only need "Maps JavaScript API".

2. Create a file `src/google-api-key.js` and put the key in there. When you're done,
it will look something like:

        export const google_key = "yourlonginscrutablegoogleapikey";

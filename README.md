# How to use

## General data flow:

Transducer -> NMEA 2000 -> gateway -> SignalK server -> MQTT broker -> client websocket

What follows are specific instructions for each point along the way.

## NMEA 2000 and gateway

The Flyer map uses an [Actisense PRO-NDC-1E2K
gateway](https://actisense.com/products/pro-ndc-1e2k/) between the ship's NMEA
2000 network, and its ethernet network. It selectively passes on data,
converting it into NMEA 0183, then puts it on ethernet, where a SignalK server
picks it up.

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


## SignalK

The Flyer map uses a [SignalK server](https://github.com/SignalK/signalk-server)
to listen to NMEA 0183 data coming from the gateway, and then at regular
intervals pass it on to a MQTT broker. Instructions below for installing the
server.

1. Install the SignalK server:

        npm install -g signalk-server

    then start it either standalone

        signalk-server

    or using demo data

        signalk-server --sample-n2k-data

2. Browse to `http://localhost:3000`. Go to `Settings` (along the left hand
   side). Fill in as appropriate. In particular, supply a value for MMSI. This
   will be used to mark the published topics to the MQTT broker.

### Install the SignalK plugins

1. Two plugins are needed. They should be installed from the configuration
   directory `~/.signalk`:

        cd ~/.signalk
        npm install signalk-mqtt-gw
        npm install signalk-derived-data

2. Then restart the SignalK server

### Configure the plugins

Next, you need to configure the plugins.

1. Copy the relevant configuration files from the repository to the SignalK
   plugin configuration directory. For example:

        cp ~/git/flyer-map-react/signalk/derived-data.json ~/.signalk/plugin-config-data
        cp ~/git/flyer-map-react/signalk/signalk-mqtt-gw.json ~/.signalk/plugin-config-data

2. Restart the SignalK server.

3. Browse to the settings for the plugin `Signal K - MQTT
   Gateway` ([link](http://localhost:3000/admin/#/serverConfiguration/plugins/signalk-mqtt-gw))
   and double-check the values. In particular, check that the MQTT Server Url is
   correct.

4. Then double check that the topics are getting published:

        mosquitto_sub -h localhost -t '#'

    The `-t '#'` says that you want to listen to all topics.


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

### Install dependencies, build, then deploy the client
    npm install
    npm run build
    npm run deploy

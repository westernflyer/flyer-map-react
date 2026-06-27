# TODO

1. Post a notice if the MQTT broker disconnects.

2. Since `APIProvider` is an application-level provider, it usually belongs near 
the root, around `<App />`, not inside a component that updates frequently from live data.

    For example, in `main.jsx`:
    
    ``` javascript
    <APIProvider apiKey={google_key} onLoad={console.log("Maps API has loaded.")}>
    <App />
    </APIProvider>
    ```
    Then remove the `APIProvider` from `App.jsx`. That prevents vessel-state updates
    from being anywhere near the provider.

3. Figure out why the IDE cannot find `/flyer-map/assets_logo_trans.png`

4. Position the infoboxes better.
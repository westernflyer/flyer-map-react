1.6.0 2026-06-27

* Better positioning of the InfoWindow in the breadcrumbs.
* Move `<APIProvider>` to root level. This gets rid of multiple loads.
* Simpler internal state. Got rid of class `FormattedState` and instead 
  formatted on the fly.


1.5.0 2026-06-25

* Use react-transition-group instead of react-fader.


1.4.0 2026-06-25

* Allow the amount of history breadcrumbs to be configured.
* Fix bugs that caused them to get truncated prematurely.

 
1.3.0 2026-04-27

* Use new MQTT message format and new JSON format.
* Show both 200WX and FT602 apparent winds.

1.2.0 2026-02-18

* Added breadcrumbs where the boat has been for the previous hour.

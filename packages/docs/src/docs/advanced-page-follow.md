---
title: Multi browser & Multi device Testing with Page Follow
tags:
  - docs
category: advanced
---

The Pattern Lab's Page Follow feature gives developers the ability to have one browser control other browsers that connect to the Pattern Lab website. Pattern Lab Node utilizes [BrowserSync](http://www.browsersync.io/) to synchronize all connected browsers and devices.

## How to Start and Connect to Pattern Lab with BrowserSync

Running `gulp patternlab:serve` or `grunt patternlab:serve` from the command line of your working directory will start up Pattern Lab with BrowserSync. By default, BrowserSync will output four URLs of note:

1. Local: [http://localhost:3000](http://localhost:3000)
2. External: http://your.ip.address:3000
3. UI: [http://localhost:3001](http://localhost:3001)
4. UI External: http://your.ip.address:3001

Any browsers on your machine will be able access these URLs. Browsers on other machines or devices on the same network should use the external URLs. Connecting to the Pattern Lab website will inform users they are also connected to BrowserSync.

## How to Stop the Page Follow

To stop watching files on Mac OS X and Windows you can press`CTRL+C` in the command line window where the process is running.

## BrowserSync Capabilities

It's strongly recommended to visit [BrowserSync](http://www.browsersync.io/) documentation or the BrowserSync UI at [http://localhost:3001](http://localhost:3001). From this administration interface one can perform the following:

- See all connected devices and browsers
- Open new tabbed instances of the Pattern Lab website on devices
- Sync all connected devices
- Reload all connected devices
- Scroll all connected devices to the top
- Toggle mouse click synchronization
- Toggle scroll synchronization
- Toggle form submission synchronization
- Toggle form input synchronization
- View browsing history of the connect session
- Toggle remote debugging tools
- Artificially throttle the network



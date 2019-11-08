---

title: Viewing Patterns on a Mobile Device | Pattern Lab
heading: Viewing Patterns on a Mobile Device
---

**Note:** *The QR code generator and xipHostname configuration option were introduced in v0.7.0 of the PHP version of Pattern Lab. As of v0.7.9 it is off by default. Turn it on in config.ini.*


While the resizing toolbar is nice it's always good to review your patterns on real mobile devices. Depending on where your patterns are located the directions are slightly different.

## For Patterns Hosted Locally on Your Computer

For an instance of the PHP version of Pattern Lab hosted locally you can do the following. These directions assume that you're using Apache to host your Pattern Lab website locally and that you've set-up a `ServerAlias` for your site using `xip.io`. The `ServerAlias` should look like `patternlab.*.xip.io`

1. Install a QR code reader on your mobile device
2. Make sure `xipHostname` in `config/config.ini` matches your `xip.io` hostname in Apache
3. Make sure your mobile device and computer are on the same WiFi network
4. Generate your website
5. Navigate to the pattern you want to view on your mobile device
6. Scan the auto-generated QR code found under the gear icon in Pattern Lab's toolbar

If you don't like QR codes you can also do the following:

1. Note the IP address for your computer. On Mac OS X this is found under System Preferences > Sharing
2. Replace the star with your IP address in the following address: `patternlab.*.xip.io`
3. Enter that into the browser on your mobile device

## For Patterns Hosted on a Server

For an instance of the PHP version of Pattern Lab hosted on a server you can do the following:

1. Install a QR code reader on your mobile device
2. Make sure `xipHostname` in `config/config.ini` is **blank**
3. Generate your website
4. Upload it to your server
5. Navigate to the pattern you want to view on your mobile device
6. Scan the auto-generated QR code found under the gear icon in Pattern Lab's toolbar

If you don't like QR codes you can simply visit the website in your browser.

---
title: Running Pattern Lab
tags:
  - docs
category: getting-started
eleventyNavigation:
  title: Running Pattern Lab
  key: getting-started
  order: 1
sitemapPriority: '0.8'
sitemapChangefreq: 'monthly'
---

## Running Pattern Lab

It's as easy as running the following command:

```
npm run start
```

This will start the system and open the URL it's running on within your browser.
Relevant information regarding and step and possible errors are being logged to the console so it's recommended to watch out for any problems possibly occuring with your installation or any of the content or data you're setting up.

### Problems and errors after restructuring files and folders

If you're doing bigger changes especially to the file and folder structure and recognize some errors on the console like e.g. `TypeError: Cannot read property 'render' of undefined` or `Error building BuildFooterHTML`, it's recommended to stop Pattern Lab, delete the cache file `dependencyGraph.json` within the projects root and start Pattern Lab again, as these changes might conflict with the existing cache structures.

### Running localhost via HTTPS

There might be use cases in which you'd like to let your [localhost dev server run via HTTPS instead of HTTP](https://github.com/pattern-lab/live-server#https), like e.g. when consuming from other secure contexts to prevent browser errors or problems.

Achieving this is a three-step process:
- generate a self-signed SSL certificate
- add it to the trusted certificates
- configure the certificates for `live-server`

#### Generate a self-signed SSL certificate

First, create a folder like, e.g., `ssl` at the root of your project.

Then run the following command in your terminal:

```
openssl req -x509 -nodes -out ssl/localhost.crt \
  -keyout ssl/localhost.key \
  -newkey rsa:2048 -sha256 \
  -subj '/CN=localhost' -extensions EXT \
  -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```

This has been adapted from <https://stackoverflow.com/a/56074120> according to the [`Let's encrypt` instructions](https://letsencrypt.org/docs/certificates-for-localhost/); additionally, DigitalOcean provides some further explanations in [a tutorial](https://www.digitalocean.com/community/tutorials/how-to-create-a-self-signed-ssl-certificate-for-nginx-in-ubuntu-16-04).

#### Add the certificate to the trusted certificates

A [stack overflow entry](https://stackoverflow.com/a/56074120) as well mentions to use the following command to add the certificate to the trusted certificates, as [suggested on a blog](https://derflounder.wordpress.com/2011/03/13/adding-new-trusted-root-certificates-to-system-keychain/):

```
sudo security add-trusted-cert -d -r trustRoot -k "/Library/Keychains/System.keychain" "ssl/localhost.crt"
```

You could as well skip this step and accept the certificate after opening the secured patternlab in your browser for the first time, as described in step 5 of the [DigitalOcean tutorial](https://www.digitalocean.com/community/tutorials/how-to-create-a-self-signed-ssl-certificate-for-nginx-in-ubuntu-16-04#step-5-test-encryption).

#### Configure the certificates for `live-server`

According to the [`live-server` documentation](https://github.com/pattern-lab/live-server#https) you'll then add those certificates to the local dev server:

> In order to enable HTTPS support, you'll need to create a configuration module.

In our case, you could e.g. create a file called `ssl.js` in the `ssl` folder with the following contents:

```js
var fs = require("fs");

module.exports = {
	cert: fs.readFileSync(__dirname + "/localhost.crt"),
	key: fs.readFileSync(__dirname + "/localhost.key")
};
```

Finally you'll have to add this as configuration module to the patternlab `serverOptions` within the `patternlab-config.json` file:
```json
"serverOptions": {
  ...
  "https": "ssl/ssl.js"
},
```

Et voilà, after starting the process of serving patternlab the next time it'll open as a secured page.

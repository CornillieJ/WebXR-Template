# WebXR with Three.Js template
> Made in Typescript. Older Javascript version is available on the legacy/javascript branch
This is a template I made that has all the boilerplate code for a WebXR game.
For this template I implemented ideas from the official Meta XR tutorial, combined with best practices from both Three.Js Journey and my university 'Howest'.  
  
This template comes with a vite config to quickly set up a https server. You can navigate using your Quest to localip:port, and run your application.

## Setup
Download [Node.js](https://nodejs.org/en/download/).
Run the following commands:

``` bash
# Install dependencies once
npm install

# Run the local server
npm run dev

# Build for production in the dist/ directory (When you are done developing)
npm run build
```

## Issues
- Cannot reach the webpage from my quest.
  > - Make sure you are on the same network
  > - make sure that your network is 'private'. 
  > - If the issue persists, try turning off your firewall temporarily, you may have to configure NodeJs by going to: 'allow an app through firewall' and making sure NodeJs Javascript Runtime is allowed on Private network.

// Minimal preload — exposes only the app version, no Node APIs.
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("decoder", {
  platform: process.platform,
});

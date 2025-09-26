
import { Buffer } from "buffer";
import process from "process";
import  crypto  from 'react-native-quick-crypto';

global.Buffer = Buffer;

// Set up Buffer
if (typeof Buffer === "undefined") global.Buffer = Buffer;

// Set up process
if (typeof process === "undefined") {
  global.process = process;
} else {
  const bProcess = process;
  for (const p in bProcess) {
    if (!(p in process)) {
      process[p] = bProcess[p];
    }
  }
}

process.browser = true;

// if (!(global as any).crypto) (global as any).crypto = crypto;

if (!global.location) {
  Object.defineProperty(global, 'location', {
    value: {
      protocol: "file:",
    },
    writable: false,
    configurable: true
  });
}

console.log(Buffer.from("Hello World!", "utf-8").toString("base64"));
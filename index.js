'use strict';

const mqtt  = require('async-mqtt');
const check = require('check-types-2');

class MqttClient {
  constructor(params) {
    Object.assign(this, params);
    check.assert.object(params, 'params is not an object');
    check.assert.string(params.url, 'params.url is not an object');
  }

  async init(handleMessage) {
    this.client = await mqtt.connectAsync(this.url);

    this.client.on('message', async(topic, messageBuffer) => {
      try {
        const data = JSON.parse(messageBuffer.toString());

        await handleMessage(topic, data);
      } catch(err) {
        this.logger.error(`Failed to parse mqtt message for '${topic}': ${messageBuffer.toString()}`, err);
      }
    });
  }

  async publish(topic, data, options = {}) {
    await this.client.publish(topic, JSON.stringify({
      ...data,
      since: new Date(),
    }), options);
  }

  async subscribe(topic) {
    await this.client.subscribe(topic);
    this.logger.debug(`Subscribed to ${topic}`);
  }
}

// shutters
const shutterStatus   = (room, shutter) => `room/${room}/shutter/${shutter}/status`;
const shutterMovement = (room, shutter) => `room/${room}/shutter/${shutter}/movement`;
const shutterToggle   = (room, shutter) => `room/${room}/shutter/${shutter}/toggle`;
const shutterUp       = (room, shutter) => `room/${room}/shutter/${shutter}/up`;
const shutterDown     = (room, shutter) => `room/${room}/shutter/${shutter}/down`;
const shutterStop     = (room, shutter) => `room/${room}/shutter/${shutter}/stop`;
const shutterMax      = (room, shutter) => `room/${room}/shutter/${shutter}/max`;

// fans
const fanControl              = (room, fan) => `room/${room}/fan/${fan}/control`;
const fanSpeed                = (room, fan) => `room/${room}/fan/${fan}/speed`;
const fanTrailingTime         = (room, fan) => `room/${room}/fan/${fan}/trailingTime`;
const fanMinRunTime           = (room, fan) => `room/${room}/fan/${fan}/minRunTime`;
const fanLightTimeout         = (room, fan) => `room/${room}/fan/${fan}/lightTimeout`;
const fanMinHumidityThreshold = (room, fan) => `room/${room}/fan/${fan}/minHumidityThreshold`;
const fanMaxHumidityThreshold = (room, fan) => `room/${room}/fan/${fan}/maxHumidityThreshold`;

// general
const lightStatus       = (room, light)    => `room/${room}/light/${light}/status`;
const windowStatus      = (room, window)   => `room/${room}/window/${window}/status`;
const temperatureStatus = (room, position) => `room/${room}/temperature/${position}/status`;
const humidityStatus    = (room, position) => `room/${room}/humidity/${position}/status`;

const buttonOpen        = (room, shutter)  => `room/${room}/button/${shutter}/open`;
const buttonClose       = (room, shutter)  => `room/${room}/button/${shutter}/close`;
const buttonActive      = (room, shutter)  => `room/${room}/button/${shutter}/active`;

const automationInit = raspi => `automation/${raspi}/init`;

const topics = {
  shutterUp,
  shutterDown,
  shutterStop,
  shutterMovement,
  shutterStatus,
  shutterToggle,
  shutterMax,
  
  buttonOpen,
  buttonClose,
  buttonActive,

  fanControl,
  fanSpeed,
  fanTrailingTime,
  fanMinRunTime,
  fanLightTimeout,
  fanMinHumidityThreshold,
  fanMaxHumidityThreshold,

  lightStatus,
  windowStatus,
  
  temperatureStatus,
  humidityStatus,

  automationInit,
};


module.exports = {
  MqttClient,
  topics,
};

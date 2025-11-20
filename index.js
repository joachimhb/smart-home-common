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

    this.logger.info(`MQTTClient init with url ${this.url}`);

    this.client.on('message', async(topic, messageBuffer) => {
      try {
        const data = JSON.parse(messageBuffer.toString());

        await handleMessage(topic, data);
      } catch(err) {
        this.logger.error(`Failed to parse mqtt message for '${topic}' : '${messageBuffer.toString()}'`, err);
      }
    });
  }

  async publish(topic, data, options = {}) {
    let finalData = data;

    if(data === null || data === undefined) {
      data = {};
    }

    if(!topic.startsWith('zigbee2mqtt')) {
      finalData = (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean' || Array.isArray(data)) ? {value: data} : data;

      Object.assign(finalData, {since: new Date()});
    }

    try {
      const res = await this.client.publish(topic, JSON.stringify(finalData), options);

      this.logger.trace(`Published '${topic}'`, {data, options});

      return res;
    } catch(err) {
      this.logger.warn(`Failed to published '${topic}'`, {data, options});
    }

  }

  async subscribe(topic) {
    await this.client.subscribe(topic);
    this.logger.debug(`Subscribed to '${topic}'`);
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
const buttonStatus      = (room, shutter)  => `room/${room}/button/${shutter}/status`;

const roomTemperatureStatus = room  => `room/${room}/temperature/overall/status`;
const roomHumidityStatus    = room  => `room/${room}/humidity/overall/status`;

const heatingSetTemperature = room  => `room/${room}/heating/overall/temperature_set`;
const heatingTriggerBoost   = room  => `room/${room}/heating/overall/boost_trigger`;
const heatingSetMode        = room  => `room/${room}/heating/overall/mode`;
const heatingBoost          = room  => `room/${room}/heating/overall/boost`;

const heatingTrvSetTemperature      = (room, trv)  => `room/${room}/heating_trv/${trv}/temperature_set`;
const heatingTrvLocalTemperature    = (room, trv)  => `room/${room}/heating_trv/${trv}/temperature_local`;
const heatingTrvExternalTemperature = (room, trv)  => `room/${room}/heating_trv/${trv}/temperature_external`;
const heatingTrvBattery             = (room, trv)  => `room/${room}/heating_trv/${trv}/battery`;
const heatingTrvLinkQuality         = (room, trv)  => `room/${room}/heating_trv/${trv}/linkquality`;
const heatingTrvCurrentValve        = (room, trv)  => `room/${room}/heating_trv/${trv}/valve_actual`;

const roomThermostatBattery     = (room, trv)  => `room/${room}/room_thermostat/${trv}/battery`;
const roomThermostatLinkQuality = (room, trv)  => `room/${room}/room_thermostat/${trv}/linkquality`;

const tuyaRoomthermostatInfo      = (room, id) => `room/${room}/tuya-roomthermostat/${id}/info`;
const sonoffHeatingthermostatInfo = (room, id) => `room/${room}/sonoff-heatingthermostat/${id}/info`;

// zigbee
const zigbeeTuyaRoomthermostat         = (room, id) => `zigbee2mqtt/${room}~tuya~roomthermostat~${id}`;
const zigbeeSonoffHeatingthermostat    = (room, id) => `zigbee2mqtt/${room}~sonoff~heatingthermostat~${id}`;
const zigbeeSonoffHeatingthermostatSet = (room, id) => `zigbee2mqtt/${room}~sonoff~heatingthermostat~${id}/set`;

const automationInit = raspi => `automation/${raspi}/init`;

const topics = {
  automationInit,

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
  buttonStatus,

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

  roomTemperatureStatus,
  roomHumidityStatus,

  heatingSetTemperature,
  heatingTriggerBoost,
  heatingSetMode,
  heatingBoost,

  heatingTrvSetTemperature,
  heatingTrvLocalTemperature,
  heatingTrvExternalTemperature,
  heatingTrvBattery,
  heatingTrvLinkQuality,
  heatingTrvCurrentValve,
  roomThermostatBattery,
  roomThermostatLinkQuality,

  tuyaRoomthermostatInfo,
  sonoffHeatingthermostatInfo,

  zigbeeTuyaRoomthermostat,
  zigbeeSonoffHeatingthermostat,
  zigbeeSonoffHeatingthermostatSet,
};


module.exports = {
  MqttClient,
  topics,
};

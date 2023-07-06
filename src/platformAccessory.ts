import {Service, PlatformAccessory, CharacteristicValue, Logger} from 'homebridge';

import { VoiceMonkeyHomebridgePlatform } from './platform';

import https from 'https';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class VoiceMonkeyPlatformAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private exampleStates = {
    On: false,
    Brightness: 100,
  };

  constructor(
    private readonly platform: VoiceMonkeyHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'VoiceMonkey')
      .setCharacteristic(this.platform.Characteristic.Model, 'Button');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // create handlers for required characteristics
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.handleOnGet.bind(this))
      .onSet(this.handleOnSet.bind(this));
  }

  handleOnGet() {
    return 0;
  }

  /**
   * Handle requests to set the "On" characteristic
   */
  handleOnSet(value) {
    const token = this.platform.config.apiToken;
    const monkey = this.accessory.displayName;
    this.platform.log.debug('Triggered SET On:', value);
    https.get(`https://api-v2.voicemonkey.io/trigger?token=${token}&device=${monkey}`, (resp) => {
      let data = '';
      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        this.platform.log.debug(JSON.parse(data).explanation);
      });

    }).on("error", (err) => {
      this.platform.log.error(err.message);
    });
  }

}

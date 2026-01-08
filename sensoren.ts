// Gib deinen Code hier ein
/**
 * Organize your blocks in groups
 */

//% color="#0fbc11" icon="\uf185"
namespace smartfeldSensoren {

    const gestureEventId = 3100;
    let lastGesture = GroveGesture.None;
    let paj7620 = new PAJ7620();
    let si1151 = new SI1151();
    let tcs34725 = new TCS34725();
    let mpr121 = new MPR121();
    let dfr0792 = new DFR0792();
    let aht20 = new AHT20();
    let scd30 = new SCD30();
    //let sen0322 = new SEN0322();

    //% group="Ultraschallsensor 101020010"
    //% block="Distanz in cm (TEST9) |%pin"
    //% subcategory="Optische Sensoren" weight=100
    export function measureInCentimetersV2(pin: DigitalPin): number {
        let distanceBackup: number = 0;
        let duration = 0;
        let RangeInCentimeters = 0;

        pins.digitalWritePin(pin, 0);
        control.waitMicros(2);
        pins.digitalWritePin(pin, 1);
        control.waitMicros(20);
        pins.digitalWritePin(pin, 0);
        duration = pins.pulseIn(pin, PulseValue.High, 50000); // Max duration 50 ms

        RangeInCentimeters = duration * 153 / 44 / 2 / 100;

        if (RangeInCentimeters > 0) distanceBackup = RangeInCentimeters;
        else RangeInCentimeters = distanceBackup;

        basic.pause(50);
        return RangeInCentimeters;
    }
    
    //% group="Bewegungsmelder 101020617"
    //% block="erkenne Bewegung |%pin"
    //% subcategory="Optische Sensoren" weight=50
    export function motionDetected(pin: DigitalPin): number {

        let motionDetected;

        motionDetected = pins.digitalReadPin(pin);

        basic.pause(50);
        return motionDetected;
    }

    //% group="Magnetschalter 101020038"
    //% block="erkenne Magnetfeld |%pin"
    //% subcategory="Mechanische Sensoren" weight=50
    export function fieldDetected(pin: DigitalPin): number {

        let fieldDetected;

        fieldDetected = pins.digitalReadPin(pin);

        basic.pause(50);
        return fieldDetected;
    }

    //% group="Kraftsensor 101020553"
    //% block="messe Kraft |%pin"
    //% subcategory="Mechanische Sensoren" weight=50
    export function kraftsensorGibKraft(pin: AnalogPin): number {

        let RangeInAnalog = 0;

        RangeInAnalog = pins.analogReadPin(pin);

        basic.pause(50);
        return RangeInAnalog;
    }

    //% group="Mikroschalter 102020143"
    //% block="Taster betätigt |%pin"
    //% subcategory="Mechanische Sensoren"
    export function microswitchActuated(pin: DigitalPin): number {

        let actuationDetected;

        actuationDetected = pins.digitalReadPin(pin);

        basic.pause(50);
        return actuationDetected;
    }

    //% group="Lichtschranke 101020174"
    //% block="Objekt in Lichtschranke erkannt |%pin"
    //% subcategory="Optische Sensoren"
    export function reflectiveLightsensorObjectDetected(pin: DigitalPin): number {

        let objectDetected;

        objectDetected = pins.digitalReadPin(pin);

        basic.pause(50);
        return objectDetected;
    }

    /**
    * init Grove Gesture modules
    * 
    */
    //% group="Gestensensor 101020083"
    //% blockId=grove_initgesture block="Gestensensor initialisieren"
    //% subcategory="Optische Sensoren"
    export function initGesture() {
        if (!paj7620) {
            paj7620.init();
        }
    }

    /**
     * get Grove Gesture model
     * 
     */
    //% group="Gestensensor 101020083"
    //% blockId=grove_getgesture block="gib Gestikmuster"
    //% subcategory="Optische Sensoren"
    export function getGestureModel(): number {
        return paj7620.read();
    }

    /**
      * Converts the gesture name to a number
      * Useful for comparisons
      */
    //% group="Gestensensor 101020083"
    //% blockId=ggesture block="Gestik %key"
    //% subcategory="Optische Sensoren"
    export function ggesture(g: GroveGesture): number {
        return g;
    }

    /**
     * Do something when a gesture is detected by Grove - Gesture
     * @param gesture type of gesture to detect
     * @param handler code to run
     */
    //% group="Gestensensor 101020083"
    //% blockId=grove_gesture_create_event block="bei Gestik|%gesture"
    //% subcategory="Optische Sensoren"
    export function onGesture(gesture: GroveGesture, handler: () => void) {
        control.onEvent(gestureEventId, gesture, handler);
        paj7620.init();
        control.inBackground(() => {
            while (true) {
                const gesture = paj7620.read();
                if (gesture != lastGesture) {
                    lastGesture = gesture;
                    control.raiseEvent(gestureEventId, lastGesture);
                }
                basic.pause(50);
            }
        })
    }

    /**
    * Init gas sensor SCD30
    *
    */
    //% group="Gassensor 101020634"
    //% block="init Gassensor"
    //% subcategory="Umweltsensoren" weight=80
    export function gas_init() {
        control.inBackground(() => {
            scd30.enableContinuousMeasurement()
            while (true) {
                scd30.readMeasurement()
                basic.pause(2000)
            }
        })
    }


    /**
    * Calibrate SCD30 to use actual value as 400 ppm
    *
    */
    //% group="Gassensor 101020634"
    //% block="setze als 400ppm Kalibrationswert"
    //% subcategory="Umweltsensoren" weight=79
    export function setGasCalibration() {
        return scd30.setCalibration400ppm();
    }

    /**
    * Read CO2eq value of gas sensor SCD30
    *
    */
    //% group="Gassensor 101020634"
    //% block="gib CO2eq"
    //% subcategory="Umweltsensoren" weight=77
    export function readGasCO2eq(): number {
        return scd30.readCO2();
    }

    /**
    * Read temperature value of gas sensor SCD30
    *
    */
    //% group="Gassensor 101020634"
    //% block="gib Temperatur"
    //% subcategory="Umweltsensoren" weight=76
    export function readGasTemp(): number {
        return scd30.readTemperature();
    }

    /**
    * Read humidity value of gas sensor SCD30
    *
    */
    //% group="Gassensor 101020634"
    //% block="gib Luftfeuchtigkeit"
    //% subcategory="Umweltsensoren" weight=75
    export function readGasHum(): number {
        return scd30.readHumidity();
    } 


    //% group="Potentiometer 101020036"
    //% block="Poti Prozentzahl Pin |%pin LED |%led"
    //% pin.defl=AnalogPin.P2 led.defl=AnalogPin.P16
    //% subcategory="Mechanische Sensoren"
    export function potentiometerGibProzent(pin: AnalogPin, led: AnalogPin): number {

        let duration = 0;
        let RangeInCentimeters = 0;
        let RangeInPercent = 0;

        RangeInCentimeters = pins.analogReadPin(pin);
        pins.analogWritePin(led, RangeInCentimeters); //setze LED auf Poti-Board
        RangeInPercent = RangeInCentimeters * 100 / 1023;

        basic.pause(50);
        return RangeInPercent;
    }

    /**
    * init Grove Sunlight module
    * 
    */
    //% group="Sonnenlicht Sensor 101020089"
    //% block="init Sonnenlicht Sensor"
    //% subcategory="Optische Sensoren"
    export function initSunlight() {
        si1151.init();
    }

    /**
    * get halfword sunlight
    * 
    */
    //% group="Sonnenlicht Sensor 101020089"
    //% block="gib sichtbares Licht [lm]"
    //% subcategory="Optische Sensoren"
    export function getHalfWord_Visible(): number {
        return Math.round(si1151.ReadHalfWord_VISIBLE());
    }

    /**
    * get halfword sunlight
    * 
    */
    //% group="Sonnenlicht Sensor 101020089"
    //% block="gib IR [lm]"
    //% subcategory="Optische Sensoren"
    export function getHalfWordIR(): number {
        return Math.round(si1151.ReadHalfWord_IR());
    }

    /**
    * start Grove Color sensor
    */
    //% group="Farbsensor 101020341"  weight=30 
    //% blockId="start_colorSensor" block="Start Sensor mit Integrationszeit %atime und Verstärkung %gain"
    //% subcategory="Optische Sensoren"
    export function start(atime: TCS34725_ATIME, gain: TCS34725_AGAIN) {
        tcs34725.start(atime, gain);
    }

    //% group="Farbsensor 101020341"  weight=25 
    //% blockId="getSensorData" block="Gib Farb Daten %colorId"
    //% subcategory="Optische Sensoren"
    export function getSensorData(colorId: RGB): number {
        return tcs34725.getSensorData(colorId);
    }

    /**
    * init HW-837 UV module
    *
    **/
    //% group="HW-837 UV-Sensor"
    //% block="gib UV index [] |%pin"
    //% subcategory="Optische Sensoren"
    export function hw837_getUV(pin: AnalogPin): number {

        let rangeInAnalog = 0;
        let sensorVoltage = 0;
        let uvIndex = 0;

        rangeInAnalog = pins.analogReadPin(pin);
        sensorVoltage = rangeInAnalog / 1024 * 3.3;
        uvIndex = Math.round(sensorVoltage / 0.1);

        basic.pause(50);
        return uvIndex;
    }

    //% group="Bodenfeuchtesensor 101020614" weight=50
    //% block="gib Bodenfeuchte Pin |%pin"
    //% pin.defl=AnalogPin.P0
    //% subcategory="Umweltsensoren"
    export function bodenfeuchteGibFeuchte(pin: AnalogPin): number {

        let moisture = 0;

        moisture = pins.analogReadPin(pin);

        basic.pause(50);
        return moisture;
    }

    //% group="Berührungssensor 101020872"
    //% blockId="mpr121_touch_is_touch_sensor_touched" block="%CH | wird berührt"
    //% subcategory="Mechanische Sensoren" weight=50
    export function isTouched(sensor: TouchSensor): boolean {
        return mpr121.isTouched(sensor);
    }


    //% group="Berührungssensor 101020872"
    //% blockId=mpr121_touch_on_touch_sensor_down
    //% block="wenn | %sensor | berührt"
    //% sensor.fieldEditor="gridpicker" sensor.fieldOptions.columns=3
    //% sensor.fieldOptions.tooltips="false"
    //% subcategory="Mechanische Sensoren" weight=65
    export function onTouchSensorTouched(sensor: TouchSensor, handler: () => void) {
        mpr121.onTouchSensorTouched(sensor, handler);
    }

    //% group="Berührungssensor 101020872"
    //% blockId=mpr121_touch_on_touch_sensor_released
    //% block="wenn | %sensor | losgelassen"
    //% subcategory="Mechanische Sensoren" weight=64
    export function onTouchSensorReleased(sensor: TouchSensor, handler: () => void){
        mpr121.onTouchSensorReleased(sensor, handler);
    }

    //% group="Berührungssensor 101020872"
    //% blockId=mpr121_touch_on_touched
    //% block="wenn beliebiger CH berührt"
    //% subcategory="Mechanische Sensoren" weight=60
    export function onAnyTouchSensorTouched(handler: () => void) {
        mpr121.onAnyTouchSensorTouched(handler);
    }

    //% group="Berührungssensor 101020872"
    //% blockId=mpr121_touch_on_released
    //% block="wenn beliebiger CH losgelassen"
    //% subcategory="Mechanische Sensoren" weight=59
    export function onAnyTouchSensorReleased(handler: () => void) {
        mpr121.onAnyTouchSensorReleased(handler);
    }

    //% group="Berührungssensor 101020872"
    //% blockId="mpr121_touch_current_touch_sensor
    //% block="zuletzt berührter CH"
    //% subcategory="Mechanische Sensoren" weight=50
    export function touchSensor(): number {
        return mpr121.touchSensor();
    }

    //% group="ADKey Board DFR0792"
    //% blockId="dfr0792_init
    //% block="Initialisiere ADKey Board an |%pin"
    //% pin.defl=AnalogPin.P0
    //% subcategory="Mechanische Sensoren" weight=42
    export function initADKeyBoard(pin: AnalogPin) {
            dfr0792.init(pin);
    }

    //% group="ADKey Board DFR0792"
    //% blockId="dfr0792_getPushedNumber
    //% block="Gib gedrückte Nummer"
    //% subcategory="Mechanische Sensoren" weight=41
    export function getPushedNumber(): number {
        return dfr0792.getPushedNumber();
    }

    //% group="ADKey Board DFR0792"
    //% blockId="dfr0792_numberIsPushed
    //% block="Gib an ob eine Nummer gedrückt ist"
    //% subcategory="Mechanische Sensoren" weight=40
    export function numberIsPushed(): boolean {
        return dfr0792.numberIsPushed();
    }
   
    //% subcategory="Umweltsensoren" weight=98
    //% group="Temperatur- und Luftfeuchtigkeitssensor 101990644"
    //% block="Lese Temperatur(°C)"
    export function lese_temperatur() {
        return Math.round(aht20.aht20ReadTemperatureC() * 100) / 100;
    }

    //% subcategory="Umweltsensoren" weight=97
    //% group="Temperatur- und Luftfeuchtigkeitssensor 101990644"
    //% block="Lese Luftfeuchtigkeit(%)"
    export function lese_luftfeuchtigkeit() {
        return Math.round(aht20.aht20ReadHumidity() * 100) / 100;
    }

    /*//% subcategory="Umweltsensoren" weight=96
    //% group="Sauerstoffsensor SEN0322"
    //% block="init Sauerstoffsensor ID %id"
    //% id.min=0 id.max=3
    export function init_sauerstoff(id = 0) {
        if (this.id < 0 || this.id > 3) {
            sen0322.setAddress(0);
        }
        else {
            sen0322.setAddress(id);
        }
    }

    //% subcategory="Umweltsensoren" weight=95
    //% group="Sauerstoffsensor SEN0322"
    //% block="Lese Sauerstoffsättigung(Prozent) %meanNum"
    //% meanNum.min=1 meanNum.max=100
    export function lese_sauerstoff(meanNum = 1) {
        if (this.meanNum < 1) {
            this.meanNum = 1;
        }
        if (this.meanNum > 100) {
            this.meanNum = 100;
        }
        return sen0322.getOxygenData(this.meanNum);
    }*/
}

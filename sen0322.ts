/**
 * SEN0322 Oxygen Sensor
 */

const SEN0322_ADDRESS = 0x70;
const OXYGEN_DATA_REGISTER = 0x03;  //Sensor hat drei Regsister. Das sind die Messdaten
const USER_SET_REGISTER = 0x08;     //Kalibrationsregister (werden nur für die Kalibrierfunktion gebraucht)
const ACUTUAL_SET_REGISTER = 0x09;   //Kalibrationsregister (werden nur für die Kalibrierfunktion gebraucht)
const GET_KEY_REGISTER = 0x0A;      //gespeicherter Key (enthält einen Kalibrierwert)

namespace smartfeldSensoren {

    export class SEN0322 {
        //Jetzt bekommt unser Sensor vier eigene Variablen
        private address: number;
        private key: number;
        private oxygenData: number[];
        private count: number;

        constructor() {
            this.address = SEN0322_ADDRESS;
            this.key = 20.9 / 120.0;
            this.oxygenData = [];
            this.count = 0;
        }

        private i2cWrite(register: number, value: number) {     //Funktion brauchen wir momentan nur für die Kalibrierung.
            let registerBuffer = pins.createBuffer(2);          //Speicher wird angelegt mit zwei Bytes (1 Byte für Register, 1 Byte für Wert)

            registerBuffer[0] = register;
            registerBuffer[1] = value;

            pins.i2cWriteBuffer(                                //werden diese beiden Bytes tatsächlich über I²C an den Sensor gesendet.
                this.address,
                registerBuffer,
                false
            );
        }

        private readFlash() {                                   //Diese Funktion möchte den gespeicherten Kalibrierwert aus dem Sensor holen.
            pins.i2cWriteNumber(
                this.address,
                GET_KEY_REGISTER,
                NumberFormat.UInt8BE,
                false
            );

            basic.pause(50);

            let value = pins.i2cReadBuffer(
                this.address,
                2,
                false
            );

            let temp = value[0] | (value[1] << 8);              //schiebt das zweite Byte acht Bits nach links.

            if (temp == 0) {
                this.key = 20.9 / 120.0;
            } else {
                this.key = temp / 1000.0;
            }
        }

        private getAverageNum(bArray: number[], len: number): number {
            let sum = 0;

            for (let i = 0; i < len; i++) {
                sum += bArray[i];
            }

            return sum / len;
        }

        setAddress(id: number) {                        //Hier kommt die ID aus deinem MakeCode-Block hinein.
            if (id < 0) {
                id = 0;
            }

            if (id > 3) {
                id = 3;
            }

            this.address = SEN0322_ADDRESS + id;
        }

        calibrate(vol: number, mv: number) {
            let keyValue = Math.round(vol * 10);

            if (mv < 0.000001 && mv > -0.000001) {
                this.i2cWrite(
                    USER_SET_REGISTER,
                    keyValue
                );
            } else {
                keyValue = Math.round((vol / mv) * 1000);

                if (keyValue > 255) {
                    keyValue = 255;
                }

                this.i2cWrite(
                    ACUTUAL_SET_REGISTER,
                    keyValue
                );
            }
        }

        getOxygenData(collectNum: number): number {             //collectNum ist die Anzahl der Messungen, über die gemittelt werden soll.

            if (collectNum < 1) {
                return -1.0;
            }

            if (collectNum > 100) {
                collectNum = 100;
            }

            this.readFlash();

            // Alte Messwerte um eine Position verschieben für die Mittelwertbildung
            for (let j = collectNum - 1; j > 0; j--) {
                this.oxygenData[j] = this.oxygenData[j - 1];
            }

            // Sauerstoffdaten anfordern
            pins.i2cWriteNumber(
                this.address,
                OXYGEN_DATA_REGISTER,
                NumberFormat.UInt8BE,
                false
            );

            basic.pause(100);

            // let rxbuf = pins.i2cReadBuffer(
            //     this.address,
            //     3,
            //     false
            // );

            // // Sauerstoffkonzentration berechnen
            // this.oxygenData[0] =
            //     this.key *
            //     (
            //         rxbuf[0]
            //         + rxbuf[1] / 10.0
            //         + rxbuf[2] / 100.0
            //     );

            let rxbuf = pins.i2cReadBuffer(
                this.address,
                3,
                false
            );

            // Rohwert berechnen
            let rawData =
                rxbuf[0]
                + rxbuf[1] / 10.0
                + rxbuf[2] / 100.0;

            // Debug-Ausgabe über USB / Serial
            serial.writeValue("Byte0", rxbuf[0]);
            serial.writeValue("Byte1", rxbuf[1]);
            serial.writeValue("Byte2", rxbuf[2]);

            serial.writeValue("Raw", rawData);
            serial.writeValue("Key", this.key);

            // Sauerstoffkonzentration berechnen
            this.oxygenData[0] = this.key * rawData;

            serial.writeValue("O2", this.oxygenData[0]);

            if (this.count < collectNum) {
                this.count++;
            }

            if (this.count > collectNum) {
                this.count = collectNum;
            }

            return this.getAverageNum(
                this.oxygenData,
                this.count
            );
        }
    }
}
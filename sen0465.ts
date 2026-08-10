/**
 * DFRobot SEN0465
 * Factory Calibrated Electrochemical Oxygen Sensor
 */

const SEN0465_BASE_ADDRESS = 0x74;

const SEN0465_CMD_GET_ALL_DATA = 0x88;
const SEN0465_GAS_TYPE_O2 = 0x05;

namespace smartfeldSensoren {

    export class SEN0465 {

        private address: number;

        constructor() {
            this.address = SEN0465_BASE_ADDRESS;
        }


        /**
         * Set I2C address by sensor ID
         *
         * ID 0 -> 0x74
         * ID 1 -> 0x75
         * ID 2 -> 0x76
         * ID 3 -> 0x77
         */
        setAddress(id: number) {

            if (id < 0) {
                id = 0;
            }

            if (id > 3) {
                id = 3;
            }

            this.address = SEN0465_BASE_ADDRESS + id;
        }


        /**
         * Calculate checksum according to DFRobot protocol
         */
        private checksum(data: Buffer): number {

            let sum = 0;

            // DFRobot checksum uses bytes 1 ... 6
            for (let i = 1; i <= 6; i++) {
                sum += data[i];
            }

            return ((~sum) + 1) & 0xFF;
        }


        /**
         * Send command packet to the sensor
         */
        private sendCommand(command: number) {

            // First byte is I2C register 0
            // followed by the 9-byte DFRobot protocol packet
            let buffer = pins.createBuffer(10);

            buffer[0] = 0x00;       // I2C register

            buffer[1] = 0xFF;       // protocol start
            buffer[2] = 0x01;       // protocol address
            buffer[3] = command;

            buffer[4] = 0x00;
            buffer[5] = 0x00;
            buffer[6] = 0x00;
            buffer[7] = 0x00;
            buffer[8] = 0x00;

            // Checksum for packet bytes 1...8
            let protocol = pins.createBuffer(9);

            for (let i = 0; i < 8; i++) {
                protocol[i] = buffer[i + 1];
            }

            protocol[8] = this.checksum(protocol);

            buffer[9] = protocol[8];

            pins.i2cWriteBuffer(
                this.address,
                buffer,
                false
            );
        }


        /**
         * Read 9-byte response from sensor
         */
        private readResponse(): Buffer {

            // DFRobot reads from I2C register 0
            pins.i2cWriteNumber(
                this.address,
                0x00,
                NumberFormat.UInt8BE,
                false
            );

            return pins.i2cReadBuffer(
                this.address,
                9,
                false
            );
        }


        /**
         * Read oxygen concentration in %Vol
         *
         * Returns -1 if communication or checksum is invalid.
         */
        getOxygenData(): number {

            this.sendCommand(SEN0465_CMD_GET_ALL_DATA);

            basic.pause(10);

            let data = this.readResponse();

            // Expected start byte
            if (data[0] != 0xFF) {
                return -1;
            }

            // Expected response command
            if (data[1] != SEN0465_CMD_GET_ALL_DATA) {
                return -1;
            }

            // Check checksum
            if (this.checksum(data) != data[8]) {
                return -1;
            }

            // SEN0465 O2 probe must report gas type 0x05
            if (data[4] != SEN0465_GAS_TYPE_O2) {
                return -1;
            }


            // Raw concentration:
            // Byte 2 = high byte
            // Byte 3 = low byte
            let concentration =
                (data[2] << 8) + data[3];


            // Byte 5 tells us the number of decimal places
            if (data[5] == 1) {

                concentration = concentration * 0.1;

            } else if (data[5] == 2) {

                concentration = concentration * 0.01;
            }


            return concentration;
        }
    }
}
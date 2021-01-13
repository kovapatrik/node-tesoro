// You have to add this function to the TesoroGramSE class and install 'inquirer' to use this.
// I had to remove this from the class because the package wouldn't be compatible with browser based applications if 'inquirer' is used.

// private async initKeys() {

//     const q = [{
//         name: "key",
//         message: "Which key?"
//     }];

//     let init_packet = packets.PACKET_INIT.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
//     let middle_packet = packets.PACKET_MIDDLE.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
//     let endPacket = packets.PACKET_SPECTRUM_END.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});

    
//     let packet2 = packets.PACKET_SPECTRUM_2.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
//     let keys  :{ [key: string]: number } ={}
//     const getKey = async (i: number) => {
//         let packet1 = packets.PACKET_SPECTRUM_1.map((item) => {return item == 'profile' ? this.profile_state.profile_num : item;});
//         packet1[i] = 255;
//         await this.sendCommand(utils.packetToByteArray(init_packet), 'initPacket');
//         await this.sendCommand(utils.packetToByteArray(middle_packet), 'middlePacket');
//         await this.sendCommand(utils.packetToByteArray(packet1), 'spectrum1Packet', 150);
//         await this.sendCommand(utils.packetToByteArray(packet2), 'spectrum2Packet'); 
//         await this.sendCommand(utils.packetToByteArray(endPacket), 'spectrumEndPacket', 280);
//         inquirer.prompt(q).then((ans) => {
//             if (ans['key']) {
//                 keys[ans['key']] = i;
//             }
//             i++;
//             if (i < 136) {
//                 getKey(i);
//             }
//         })
//         console.log(keys);
//     }
//     getKey(8)
// }
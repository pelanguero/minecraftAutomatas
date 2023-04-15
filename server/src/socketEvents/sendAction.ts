import { debug } from "@/config";
import { SocketProps } from "@/load_server";
import { Socket } from "socket.io";

export default (socket: Socket, props: SocketProps) => {
    const { io, botsConnected, masters, sendMastersOnline, chests, setChests, portals, setPortals } = props

    socket.on("sendAction", (data) => {
        let index;

        if (debug) console.log(data);

        switch (data.action) {
            case "action":
                io.to(data.socketId).emit("action", data.toBotData);
                break;
            case "startStateMachine":
                io.to(data.socketId).emit("action", {
                    type: "startStateMachine",
                    value: data.value,
                });
                index = botsConnected.findIndex((e) => {
                    return e.socketId === data.socketId;
                });
                if (index >= 0) {
                    botsConnected[index].stateMachinePort = data.value.port;
                    io.to("usersLoged").emit("botsOnline", botsConnected);
                }
                break;
            case "startInventory":
                io.to(data.socketId).emit("action", {
                    type: "startInventory",
                    value: data.value,
                });
                index = botsConnected.findIndex((e) => {
                    return e.socketId === data.socketId;
                });
                if (index >= 0) {
                    botsConnected[index].inventoryPort = data.value.port;
                    io.to("usersLoged").emit("botsOnline", botsConnected);
                }
                break;
            case "startViewer":
                io.to(data.socketId).emit("action", {
                    type: "startViewer",
                    value: data.value,
                });
                index = botsConnected.findIndex((e) => {
                    return e.socketId === data.socketId;
                });
                if (index >= 0) {
                    botsConnected[index].viewerPort = data.value.port;
                    io.to("usersLoged").emit("botsOnline", botsConnected);
                }
                break;
            case "sendDisconnect":
                io.to(data.socketId).emit("sendDisconnect", data.value);
                break;
            case "getConfig":
                io.to(data.socketId).emit("getConfig", socket.id);
                break;
            case "sendConfig":
                data.value.socketId = socket.id;
                io.to("usersLoged").emit("sendConfig", data.value);
                break;
            case "changeConfig":
                data.value.fromSocketId = socket.id;
                io.to(data.socketId).emit("changeConfig", data.value);
                break;
            case "addMaster":
                if (data.value === undefined) {
                    return;
                }
                data.value = data.value.trim();

                const masterToAddIndex = masters.findIndex((e) => {
                    return e.name === data.value;
                });
                if (masterToAddIndex < 0 && data.value !== "") {
                    masters.push({
                        name: data.value,
                    });
                }

                sendMastersOnline()
                break;
            case "removeMaster":
                if (data.value === undefined) {
                    return;
                }
                data.value = data.value.trim();

                const masterToRemoveIndex = masters.findIndex((e) => {
                    return e.name === data.value;
                });
                if (masterToRemoveIndex >= 0) {
                    masters.splice(masterToRemoveIndex, 1);
                }

                sendMastersOnline()
                break;
            case "setChests":
                if (data.value === undefined) {
                    return;
                }

                const newChests = data.value
                setChests(newChests);

                io.to("usersLoged").emit("action", {
                    type: "getChests",
                    value: newChests,
                });
                break;

            case "getChests":
                socket.emit("action", { type: "getChests", value: chests });
                break;

            case "setPortals":
                if (data.value === undefined) {
                    return;
                }

                const newPortals = data.value;
                setPortals(newPortals)
                io.to("usersLoged").emit("action", {
                    type: "getPortals",
                    value: newPortals,
                });
                break;

            case "getPortals":
                socket.emit("action", { type: "getPortals", value: portals });
                break;
        }
    });

}
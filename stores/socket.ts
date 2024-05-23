import { io } from 'socket.io-client';
import create from 'zustand';

type SocketStore = {
    socket: any;
};

const startSocket = io();

const useSocketStore = create<SocketStore>((set) => ({
    socket: startSocket,
}));

export default useSocketStore;
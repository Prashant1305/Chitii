import PeerService from './PeerService';

class PeerServiceManager {
    constructor() {
        this.peerServices = new Map(); // A Map to hold instances of PeerService
    }

    // Method to create a new PeerService instance or retrieve an existing one by ID
    getPeerService(id) {
        if (!this.peerServices.has(id)) {
            console.log(`Creating new PeerService for id: ${id}`);
            const peerService = new PeerService();
            this.peerServices.set(id, peerService);
        } else {
            console.log(`Reusing existing PeerService for id: ${id}`);
        }
        return this.peerServices.get(id);
    }

    // Method to delete a specific PeerService instance by ID
    deletePeerService(id) {
        if (this.peerServices.has(id)) {
            console.log(`Deleting PeerService for id: ${id}`);
            const peerService = this.peerServices.get(id);
            peerService.disconnect(); // Disconnect the PeerService instance
            this.peerServices.delete(id); // Remove it from the Map
        } else {
            console.log(`No PeerService found for id: ${id}`);
        }
    }

    // Method to clear all PeerService instances
    clearAllPeerServices() {
        console.log(`Clearing all PeerService instances`);
        this.peerServices.forEach((peerService, id) => {
            console.log(`Disconnecting PeerService for id: ${id}`);
            peerService.disconnect();
        });
        this.peerServices.clear();
    }
}

export const PeerServices = new PeerServiceManager();

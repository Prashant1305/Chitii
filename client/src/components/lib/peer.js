class PeerService {
    constructor() {
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: [
                            "stun:stun.l.google.com:19302",
                            "stun:global.stun.twilio.com:3478",
                        ],
                    },
                ],
            });
        }
    }

    async getAnswer(offer) {
        if (this.peer) {
            await this.peer.setRemoteDescription(offer);
            const ans = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans;
        }
    }
    // Purpose: Handles an incoming offer and generates an answer.
    // Steps:
    //  Set Remote Description: Sets the received offer as the remote description.
    //  Create Answer: Generates an SDP answer.
    //  Set Local Description: Sets the generated answer as the local description.
    //  Return Answer: Returns the generated answer to be sent back to the offerer.

    async setLocalDescription(ans) {
        if (this.peer) {
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
        }
    }
    // Purpose: Sets the remote description with the provided answer.
    // Steps:
    //  Set Remote Description: Sets the provided answer as the remote description.

    async getOffer() {
        if (this.peer) {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer;
        }
    }
    //  Purpose: Creates an SDP offer to initiate a WebRTC connection.
    // Steps:
    //  Create Offer: Generates an SDP offer.
    //  Set Local Description: Sets the generated offer as the local description.
    //  Return Offer: Returns the generated offer to be sent to the remote peer.
}

export default new PeerService();
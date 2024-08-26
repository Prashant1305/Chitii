

const ALERT = 'ALERT';
const REFETCH_CHATS = "REFETCHED_CHATS";
const NEW_MESSAGE_ALERTS = "NEW_MESSAGE_ALERTS";
const NEW_REQUEST = "NEW_REQUEST";
const NEW_MESSAGE = "NEW_MESSAGE"; // when message is of same chat that is opened
const START_TYPING = "START_TYPING"
const STOP_TYPING = "STOP_TYPING"

const CHAT_JOINED = "CHAT_JOINED"
const CHAT_LEFT = "CHAT_LEFT"
const ONLINE_USERS = "ONLINE_USERS"


const CALL_INCOMING = "CALL_INCOMING";
const CALL_RECEIVED = "CALL_RECEIVED";
const CALL_ENDED = "CALL_ENDED"

const CLIENT_CREATE_OFFER = "CLIENT_CREATE_OFFER";
const HANDLE_OFFER_CREATE_ANSWERE = "HANDLE_OFFER_CREATE_ANSWERE";
const HANDLE_CREATED_ANSWERE = "HANDLE_CREATED_ANSWERE"
const HANDLE_ANSWERE = "HANDLE_ANSWERE";

const INITIATE_P2P = "INITIATE_P2P"

const NEGOTIATION_NEEDED = "negotiationneeded";
const PEER_NEGO_NEEDED = "PEER_NEGO_NEEDED"
const PEER_NEGO_DONE = "PEER_NEGO_DONE"
const PEER_NEGO_FINAL = "PEER_NEGO_FINAL";
const END_CALL = "END_CALL";

module.exports = { ALERT, REFETCH_CHATS, NEW_MESSAGE_ALERTS, NEW_REQUEST, NEW_MESSAGE, START_TYPING, STOP_TYPING, CHAT_JOINED, CHAT_LEFT, ONLINE_USERS, CALL_INCOMING, CALL_RECEIVED, CALL_ENDED, CLIENT_CREATE_OFFER, HANDLE_OFFER_CREATE_ANSWERE, HANDLE_ANSWERE, INITIATE_P2P, HANDLE_CREATED_ANSWERE, NEGOTIATION_NEEDED, PEER_NEGO_NEEDED, PEER_NEGO_DONE, PEER_NEGO_FINAL, END_CALL };
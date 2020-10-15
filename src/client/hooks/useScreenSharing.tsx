import { useEffect, useCallback, useState } from "react";
import Peer from "peerjs";
import { peerOptions } from "../peer/peer";

export type ScreenSharingData = {

}

export const useScreenSharing = (socket: SocketIOClient.Socket): ScreenSharingData => {
	const [peer] = useState<Peer>(() => new Peer(peerOptions));
	// Create new peer
	// Send socket event to server to notify screen sharing
	// Call all other peers and send stream
	// TODO: in other peers, must NOT put this peer to the list of peer streams,
	//  instead have a separate way to track the stream
	// Do NOT wait for other peer's streams.
	return {};
}
import React, { useState } from "react";
import { useDynamicFetch, useFetch } from "../hooks";
import { VideoSessionResponseType } from "../../types";
import { Link } from "react-router-dom";
import { Button, Col, Form, Spinner } from "react-bootstrap";
import { requestIsLoaded } from "../utils";
import { create } from "domain";
import { RequestState } from "../types";


export const VideoRoomLobby: React.FunctionComponent = () => {
	const [roomsResponse, refresh] = useFetch<Array<VideoSessionResponseType>>("/videos");
	const [createRoomResponse, createRoomRequest] = useDynamicFetch<undefined, { name: string }>("/videos/create", undefined, false);
	const [newRoomInput, setNewRoomInput] = useState<string>("");
	if (!requestIsLoaded(roomsResponse)) {
		return <Spinner animation="border"/>;
	}
	if (createRoomResponse.state === RequestState.ERROR) {
		return <div>Error while creating room</div>;
	}
	const createRoom = async (name: string) => {
		await createRoomRequest({name});
		await refresh();
	};
	return <div>
		<ul>
		{roomsResponse.data.map(({sessionId, name}) => (
			<li key={sessionId}><Link to={`/video-test/${sessionId}`}>{name}</Link></li>
		))}
		</ul>
		<Form onSubmit={e => createRoom(newRoomInput)}>
			<Form.Row>
				<Col>
					<Form.Control type="text" placeholder="Enter room name" value={newRoomInput}
					              onChange={e => setNewRoomInput(e.target.value)}/>
				</Col>
				<Col xs="auto">
					<Button type="submit">
						Create
					</Button>
				</Col>
			</Form.Row>
		</Form>
	</div>;
}
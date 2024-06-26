"use client";
import useNotification from "@/hooks/useNotification";
import useSocketStore from "@/stores/socket";
import useUserStore from "@/stores/user";
import { redirect } from "next/navigation";
import React, { useEffect, useState } from "react";

function Room({ params }: Readonly<{ params: { id: string } }>) {
	const { id } = params;
	const { socket } = useSocketStore();
	const { user } = useUserStore();
	const { sendNotification } = useNotification();

	if (user.id === "") redirect("/");

	useEffect(() => {
		socket.emit("join-room", {
			room: id,
			user: user,
		});
	}, [id]);

	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<Array<Message | SystemEvent>>([]);

	const getCurrentTime = (): string => {
		const date = new Date();
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${hours}:${minutes}`;
	};

	const sendMessage = () => {
		if (!message) return;
		socket.emit("send-message", {
			room: id,
			user: user,
			message: message,
			time: getCurrentTime(),
		});

		setMessage("");
	};

	useEffect(() => {
		socket.on("receive-message", (data: Message) => {
			setMessages((prev) => [...prev, data]);
			if (data.user.id !== user.id) {
				sendNotification(id, `${data.user.userName} sent a message`, data.message);
			}
		});

		socket.on("receive-system-event", (data: SystemEvent) => {
			setMessages((prev) => [...prev, data]);

			sendNotification(id, data.eventMessage);
		});
	}, [socket]);

	useEffect(() => {
		const messagesElement = document.querySelector(".messages-area") as HTMLElement;
		if (messagesElement) {
			messagesElement.scrollTop = messagesElement.scrollHeight;
		}
	}, [messages]);

	return (
		<div className="md:w-[90%] lg:w-1/2 2xl:w-1/3 h-[100svh] flex flex-col gap-4 items-center justify-center mx-4 sm:mx-6 md:mx-auto">
			<div className="flex flex-col bg-gray-700 border border-gray-600 w-full h-[calc(100svh-50px)] lg:h-5/6 rounded-2xl overflow-y-auto">
				<div className="p-4 bg-zinc-800 rounded-t-lg">
					<div className="flex gap-2 items-center">
						<h1 className="text-white text-lg">Room: {id}</h1>
					</div>
				</div>
				<div className="grow overflow-y-hidden ">
					<div className="messages-area py-4 px-4 flex flex-col gap-5 overflow-y-auto overflow-x-visible h-full max-h-full scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
						{messages.map((msg, index) => {
							if ((msg as Message).user) {
								const message = msg as Message;
								return (
									<div key={index} className={`flex flex-col gap-2 max-w-[90%] ${message.user.id === user.id ? "items-end ms-auto" : "items-start me-auto"}`}>
										<div className={`flex flex-col justify-center rounded-[10px] p-2.5 ${message.user.id === user.id ? "bg-indigo-600 text-white rounded-br-none" : "bg-gray-600 text-white rounded-bl-none"}`}>
											{message.user.id !== user.id && <span className="text-xs opacity-80">{message.user.userName}</span>}
											<p className="text-md">{message.message}</p>
											<span className={`text-xs opacity-80 ${message.user.id === user.id ? "ms-auto" : ""}`}>{message.time}</span>
										</div>
									</div>
								);
							} else {
								const systemEvent = msg as SystemEvent;
								return (
									<div key={index} className="flex flex-col gap-1 items-center">
										<span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs bg-gray-600 text-white">
											<span className={`size-1.5 inline-block rounded-full ${systemEvent.type === "join" ? "bg-green-500" : "bg-red-500"}`}></span>
											<span className="opacity-80">{systemEvent.eventMessage}</span>
										</span>
										<span className="text-[10px] opacity-40">{systemEvent.time}</span>
									</div>
								);
							}
						})}
					</div>
				</div>
				<div className="p-4 rounded-b-lg mt-auto">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							sendMessage();
						}}
						className="flex gap-2 items-center"
					>
						<input type="text" placeholder="Message" className="py-3 px-6 w-full z-20 text-md text-white rounded-full border-2 bg-gray-700  border-gray-600 placeholder-gray-400 focus:border-indigo-600 outline-none" value={message} onChange={(e) => setMessage(e.target.value)} />
						<button type="submit" className="py-3 px-6 z-20 text-md text-white rounded-full border-2 bg-indigo-600  border-indigo-700 placeholder-gray-400 hover:border-indigo-600 hover:bg-indigo-600 outline-none transition-all">
							Send
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}

export default Room;

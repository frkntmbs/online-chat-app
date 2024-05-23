"use client";
import useSocketStore from "@/stores/socket";
import useUserStore from "@/stores/user";
import Link from "next/link";
import { useState } from "react";

export default function Page() {
	const { socket } = useSocketStore();

	const { user, setUsername } = useUserStore();
	const [room, setRoom] = useState("");

	return (
		<div className="w-1/4 h-screen flex flex-col gap-4 items-center justify-center mx-auto">
			<div className="grid grid-cols-2 gap-4 w-full">
				<input type="text" placeholder="Username" className="py-3 px-6 w-full z-20 text-md text-white rounded-full border-2 bg-gray-700  border-gray-600 placeholder-gray-400 focus:border-indigo-600 outline-none" value={user.userName} onChange={(e) => setUsername(e.target.value)} />
				<input type="text" placeholder="Room" className="py-3 px-6 w-full z-20 text-md text-white rounded-full border-2 bg-gray-700  border-gray-600 placeholder-gray-400 focus:border-indigo-600 outline-none" value={room} onChange={(e) => setRoom(e.target.value)} />
			</div>
			<Link href={`/room/${room}`} className="py-3 px-6 w-full z-20 text-md text-white rounded-full border-2 bg-gray-700  border-gray-600 placeholder-gray-400 hover:border-indigo-600 hover:bg-indigo-600 outline-none transition-all">
				Join Chat
			</Link>
		</div>
	);
}

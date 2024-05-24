interface SystemEvent {
    eventMessage: string;
    time: string;
    type: "join" | "leave";
}

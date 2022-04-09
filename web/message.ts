export enum ReceivedCommand {}

export enum SendedCommand {}

export interface MessageData<T> {
    command: `apngPlayer.${string}`;
    data: T;
}

export function send<T>(command: string, data?: MessageData<T>) {
    window.__vscode__.postMessage({
        command: `apngPlayer.${command}`,
        data,
    });
}

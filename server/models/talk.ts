export interface Talk {
    author: string;
    timestamp: Date;
    title: string;
    context: string;
    messages: TalkMessage[];
}

export interface TalkMessage {
    speaker: string;
    content: string;
}

export interface Discussion {
    talkId: any;
    entries: DiscussionEntry[];
}

export interface DiscussionEntry {
    poster: string;
    timestamp: Date;
    content: string;
}

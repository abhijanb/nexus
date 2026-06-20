import { useAppSelector } from "../../app/hooks";

interface Props {
    channelId?: string;
    conversationId?: string;
}

function formatNames(users: Array<{ userName: string }>): string {
    if (users.length === 0) return "";
    if (users.length === 1) return `${users[0].userName} is typing`;
    if (users.length === 2) return `${users[0].userName} and ${users[1].userName} are typing`;
    return `${users[0].userName} and ${users.length - 1} others are typing`;
}

export function TypingIndicator({ channelId, conversationId }: Props) {
    const key = channelId ?? conversationId ?? "";
    const typingUsers = useAppSelector((s) => s.typing.typingUsers[key] ?? []);

    if (typingUsers.length === 0) return null;

    return (
        <div className="text-xs text-on-surface-variant italic px-4 py-1 animate-pulse">
            {formatNames(typingUsers)}...
        </div>
    );
}

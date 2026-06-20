class PresenceManager {
    private online = new Map<string, Set<string>>();

    addUser(userId: string, socketId: string): boolean {
        const sockets = this.online.get(userId) ?? new Set<string>();
        sockets.add(socketId);
        this.online.set(userId, sockets);
        return sockets.size === 1;
    }

    removeUser(userId: string, socketId: string): boolean {
        const sockets = this.online.get(userId);
        if (!sockets) return false;
        sockets.delete(socketId);
        if (sockets.size === 0) {
            this.online.delete(userId);
            return true;
        }
        return false;
    }

    isOnline(userId: string): boolean {
        return this.online.has(userId);
    }

    getAllOnline(): string[] {
        return Array.from(this.online.keys());
    }
}

export const presenceManager = new PresenceManager();

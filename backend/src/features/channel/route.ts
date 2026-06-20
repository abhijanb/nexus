import { Router } from "express";
import { acceptChannelInvite, createChannel, deleteChannel, getChannel, inviteToChannel, listChannels, pendingChannelInvites, rejectChannelInvite, updateChannel } from "./controller";
import { authenticate } from "../../middleware/authenticate";
import messageRoutes from "./_child/messages/route";
import memberRoutes from "./_child/member/route";

const channelRoutes: Router = Router();
channelRoutes.use(authenticate);

// Invites must come before /:id to avoid matching "invites" as an id
channelRoutes.get("/invites/pending", pendingChannelInvites);
channelRoutes.post("/invites/:id/accept", acceptChannelInvite);
channelRoutes.post("/invites/:id/reject", rejectChannelInvite);

// Standard REST
channelRoutes.get("/", listChannels);
channelRoutes.post("/", createChannel);
channelRoutes.get("/:id", getChannel);
channelRoutes.put("/:id", updateChannel);
channelRoutes.delete("/:id", deleteChannel);
channelRoutes.post("/:id/invite", inviteToChannel);

// child routes
channelRoutes.use("/:id/messages",messageRoutes);
channelRoutes.use("/:id/members", memberRoutes);

export default channelRoutes;
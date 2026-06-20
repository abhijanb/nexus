import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usePostChannelMutation } from "../../../workspaceApi";
import type { CreateChannelData } from "../schemas/createChannel.schema";
import createChannelSchema from "../schemas/createChannel.schema";

export const useCreateChannel = () => {
    const [postChannel] = usePostChannelMutation();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<CreateChannelData>({
        resolver: zodResolver(createChannelSchema),
        defaultValues: {
            name: "",
            description: "",
            privacy: "PUBLIC",
            isArchived: false,
        },
    });

    const [privacy, isArchived] = useWatch({ control, name: ["privacy", "isArchived"] });

    const onSubmit = async (data: CreateChannelData) => {
        try {
            await postChannel({
                name: data.name,
                description: data.description,
                type: data.privacy,
                isArchived: data.isArchived,
            }).unwrap();
            toast.success("Channel created");
            navigate(`/channels`);
        } catch (error) {
            toast.error("Failed to create channel");
            console.error("Failed to create channel:", error);
        }
    };
    return {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        privacy,
        isArchived,
        onSubmit
    }
}
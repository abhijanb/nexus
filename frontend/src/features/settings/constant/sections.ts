import { User, UserCog, Bell, Palette, Shield, Phone } from "lucide-react";

export const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: UserCog },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
  { id: "calls", label: "Calls", icon: Phone },
] as const;

export type SectionId = (typeof sections)[number]["id"];

import { useState } from "react";
import { cn } from "../../../shared/lib/utils";
import { Camera, Mic, Volume2, Monitor, PhoneIncoming, AudioLines, PhoneOff } from "lucide-react";

type Quality = "720p" | "1080p" | "4k";

const QUALITY_OPTIONS: { value: Quality; label: string }[] = [
  { value: "720p", label: "Standard" },
  { value: "1080p", label: "High" },
  { value: "4k", label: "Very High" },
];

const DEVICE_OPTIONS = [
  { value: "default", label: "System Default" },
  { value: "builtin", label: "Built-in" },
  { value: "external", label: "External USB" },
];

interface PrefItem {
  key: string;
  icon: typeof Camera;
  label: string;
  desc: string;
}

const PREFERENCES: PrefItem[] = [
  { key: "autoAccept", icon: PhoneIncoming, label: "Auto-accept calls", desc: "Automatically accept calls from friends" },
  { key: "noiseSuppression", icon: AudioLines, label: "Noise suppression", desc: "Reduce background noise during calls" },
  { key: "echoCancellation", icon: PhoneOff, label: "Echo cancellation", desc: "Remove echo from audio output" },
];

export default function CallSettingsPage() {
  const [camera, setCamera] = useState("default");
  const [microphone, setMicrophone] = useState("default");
  const [speaker, setSpeaker] = useState("default");
  const [quality, setQuality] = useState<Quality>("1080p");
  const [prefs, setPrefs] = useState({
    autoAccept: false,
    noiseSuppression: true,
    echoCancellation: true,
  });

  const togglePref = (key: string) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Video Call Settings</h2>
        <p className="text-on-surface-variant text-body-md mt-1">
          Configure your devices and call preferences.
        </p>
      </section>

      <section>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Devices</h3>
        <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
          <DeviceRow
            icon={Camera}
            label="Camera"
            value={camera}
            onChange={setCamera}
            options={DEVICE_OPTIONS}
          />
          <DeviceRow
            icon={Mic}
            label="Microphone"
            value={microphone}
            onChange={setMicrophone}
            options={DEVICE_OPTIONS}
          />
          <DeviceRow
            icon={Volume2}
            label="Speaker"
            value={speaker}
            onChange={setSpeaker}
            options={DEVICE_OPTIONS}
          />
        </div>
      </section>

      <section>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Video Quality</h3>
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
              <Monitor size={20} />
            </div>
            <div>
              <p className="text-body-md text-on-surface font-medium">Resolution</p>
              <p className="text-label-sm text-on-surface-variant">Higher quality uses more bandwidth</p>
            </div>
          </div>
          <div className="flex gap-2">
            {QUALITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setQuality(opt.value)}
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-lg font-label-md text-label-md transition-colors",
                  quality === opt.value
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-variant",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Preferences</h3>
        <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
          {PREFERENCES.map((pref) => (
            <div
              key={pref.key}
              className="flex items-center justify-between px-6 py-4 border-b border-outline-variant last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <pref.icon size={20} />
                </div>
                <div>
                  <p className="text-body-md text-on-surface font-medium">{pref.label}</p>
                  <p className="text-label-sm text-on-surface-variant">{pref.desc}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs[pref.key as keyof typeof prefs]}
                  onChange={() => togglePref(pref.key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 rounded-full peer peer-checked:bg-primary bg-surface-variant after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DeviceRow({
  icon: Icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: typeof Camera;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant last:border-b-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
          <Icon size={20} />
        </div>
        <span className="text-body-md text-on-surface font-medium">{label}</span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface border border-outline-variant px-3 py-1.5 rounded-lg text-on-surface text-body-md transition-all focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

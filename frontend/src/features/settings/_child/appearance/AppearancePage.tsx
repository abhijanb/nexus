import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "../../../../shared/lib/utils";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { setTheme, type Theme } from "../../../../app/themeSlice";

const themes: { id: Theme; label: string; Icon: typeof Moon }[] = [
  { id: "dark", label: "Dark", Icon: Moon },
  { id: "light", label: "Light", Icon: Sun },
];

const colors = [
  { name: "Nexus Indigo", value: "#c3c0ff" },
  { name: "Terminal Green", value: "#4edea3" },
  { name: "Solarized Orange", value: "#ffb95f" },
  { name: "Ruby Red", value: "#ffb4ab" },
] as const;

export default function AppearancePage() {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((s) => s.theme.theme);
  const [selectedColor, setSelectedColor] = useState("#c3c0ff");

  return (
    <>
      <section>
        <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Appearance</h2>
        <p className="text-body-lg text-on-surface-variant">Customize how Nexus looks and feels on your machine.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          {/* Theme Engine */}
          <section className="bg-surface-container-low p-6 rounded border border-outline-variant">
            <h3 className="text-label-md text-primary font-bold uppercase tracking-wider mb-4">Theme</h3>
            <div className="grid grid-cols-2 gap-4">
              {themes.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => dispatch(setTheme(id))}
                  className="group flex flex-col gap-2 text-left focus:outline-none"
                >
                  <div
                    className={cn(
                      "aspect-video w-full rounded-lg border-2 p-3 flex flex-col gap-2 transition-all",
                      currentTheme === id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-outline-variant hover:border-on-surface-variant"
                    )}
                  >
                    <Icon
                      size={24}
                      className={cn(
                        "self-center",
                        currentTheme === id ? "text-primary" : "text-on-surface-variant"
                      )}
                    />
                    <span className={cn(
                      "text-label-md text-center font-bold",
                      currentTheme === id ? "text-on-surface" : "text-on-surface-variant"
                    )}>
                      {label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Color Accents */}
          <section className="bg-surface-container-low p-6 rounded border border-outline-variant">
            <h3 className="text-label-md text-primary font-bold uppercase tracking-wider mb-4">Color Accent</h3>
            <div className="flex flex-wrap gap-3">
              {colors.map(({ name, value }) => (
                <button
                  key={value}
                  onClick={() => setSelectedColor(value)}
                  className={cn(
                    "w-8 h-8 rounded-full hover:scale-110 transition-transform cursor-pointer",
                    selectedColor === value && "ring-2 ring-offset-2 ring-offset-surface ring-primary"
                  )}
                  style={{ backgroundColor: value }}
                  title={name}
                />
              ))}
              <button
                className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                title="Custom"
              >
                <span className="text-xs text-on-surface-variant font-bold">+</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

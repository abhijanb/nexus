import { Tag, Globe, Lock, Rocket } from "lucide-react";
import { useCreateChannel } from "../hooks/useCreateChannel";

export default function CreateChannelForm() {
const { register, handleSubmit, setValue, formState: { errors }, privacy, isArchived, onSubmit } = useCreateChannel();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-outline-variant bg-surface-container">
            <h1 className="font-headline-md text-headline-md text-on-surface">Channel Configuration</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Define the parameters and constraints for the new communication stream.</p>
          </div>
          <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="name">Channel Name</label>
              <div className="relative group">
                <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <input
                  className="w-full pl-10 pr-4 py-4 bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg font-code-md text-code-md text-on-surface placeholder:text-outline transition-all"
                  placeholder="e.g. backend-sprint-planning"
                  type="text"
                  id="name"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-error font-label-sm text-label-sm">{errors.name.message}</p>
              )}
              <span className="font-label-sm text-label-sm text-outline">Maximum 64 characters. Use hyphens for spaces.</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider" htmlFor="description">Description</label>
              </div>
              <textarea
                className="w-full px-4 py-4 bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline transition-all resize-none"
                placeholder="Objectives, scope, and initial repository references..."
                rows={4}
                id="description"
                {...register("description")}
              />
            </div>
            <div className="flex flex-col gap-4">
              <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Privacy Mode</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue("privacy", "PUBLIC", { shouldValidate: true })}
                  className={`flex flex-col gap-1 p-4 border-2 rounded-xl text-left transition-all ${privacy === "PUBLIC"
                      ? "border-primary bg-primary-container/10"
                      : "border-outline-variant hover:border-outline bg-surface-container-lowest"
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <Globe size={20} className={privacy === "PUBLIC" ? "text-primary" : "text-outline"} />
                    <div className={`w-4 h-4 rounded-full border-4 ${privacy === "PUBLIC" ? "border-primary bg-on-primary" : "border-outline-variant"
                      }`} />
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-bold">Public</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Visible to all workspace members.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setValue("privacy", "PRIVATE", { shouldValidate: true })}
                  className={`flex flex-col gap-1 p-4 border-2 rounded-xl text-left transition-all ${privacy === "PRIVATE"
                      ? "border-primary bg-primary-container/10"
                      : "border-outline-variant hover:border-outline bg-surface-container-lowest"
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <Lock size={20} className={privacy === "PRIVATE" ? "text-primary" : "text-outline"} />
                    <div className={`w-4 h-4 rounded-full border-4 ${privacy === "PRIVATE" ? "border-primary bg-on-primary" : "border-outline-variant"
                      }`} />
                  </div>
                  <span className="font-label-md text-label-md text-on-surface font-bold">Private</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Restricted to invited members only.</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant rounded-lg">
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-surface font-bold">Archive on Initialize</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Create as an archived record for historical reference.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input className="sr-only peer" type="checkbox" {...register("isArchived")} />
                <div className={`w-11 h-6 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isArchived ? "bg-primary" : "bg-surface-variant"
                  }`} />
              </label>
            </div>
          </div>
        </div>
        <div className="flex justify-end items-center gap-4 mb-12">
          <button type="button" className="px-6 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all">Cancel</button>
          <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-primary-container text-on-primary-container rounded-lg font-bold shadow-lg shadow-primary-container/20 active:scale-95 transition-all">
            <Rocket size={16} />
            <span className="font-label-md text-label-md">Initialize Channel</span>
          </button>
        </div>
      </div>
    </form>
  );
}

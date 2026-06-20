import CreateChannelForm from "../components/CreateChannelForm";

export default function CreateChannelPage() {
  return (
    <div className="h-full overflow-y-auto bg-background relative">
      <div className="flex justify-center items-start py-12 px-4 md:px-8">
        <CreateChannelForm />
      </div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
}

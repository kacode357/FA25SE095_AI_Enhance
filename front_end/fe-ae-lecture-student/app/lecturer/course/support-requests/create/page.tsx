import CreateSupportRequestForm from "../components/CreateSupportRequestForm";

export default function Page() {
  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-4">Create Support Request</h1>
      <CreateSupportRequestForm />
    </div>
  );
}

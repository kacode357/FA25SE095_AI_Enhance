import CreateSupportRequestForm from "../../../support-requests/components/CreateSupportRequestForm";

type Props = {
  params: {
    courseId: string;
  };
};

export default function Page({ params }: Props) {
  const { courseId } = params;

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold mb-4">Create Support Request</h1>
      <CreateSupportRequestForm courseId={courseId} />
    </div>
  );
}

import Protected from "@/components/providers/Protected";

export default function Template({ children }: { children: React.ReactNode }) {
  return <Protected>{children}</Protected>;
}

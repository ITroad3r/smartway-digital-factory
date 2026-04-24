import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

export default function DynamicIcon({ name, ...props }: { name?: string | null } & LucideProps) {
  const Cmp = (name && (Icons as any)[name]) || Icons.Sparkles;
  return <Cmp {...props} />;
}

import type { Metadata } from "next";
import ResumeContent from "@/components/ResumeContent";

export const metadata: Metadata = {
  title: "Resume",
  description: "Jonathon Watterson's data engineering resume, selected platform work, and technical skills.",
};

export default function ResumePage() { return <ResumeContent />; }

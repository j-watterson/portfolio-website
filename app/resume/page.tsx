import type { Metadata } from "next";
import ResumeContent from "@/components/ResumeContent";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Jonathon Watterson's data engineering resume, including seven years of experience building ETL pipelines, cloud warehouses, automation, and analytics platforms.",
};

export default function ResumePage() { return <ResumeContent />; }

import { Button } from "@/components/ui/button";
import { assertAuthenticated } from "@/lib/session";
import { cn } from "@/lib/utils";
import { cardStyles, pageTitleStyles } from "@/styles/common";
import { btnIconStyles, btnStyles } from "@/styles/icons";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";

export default async function DashboardPage() {
  const user = await assertAuthenticated();


  return (
    <>
      <PageHeader>
        <h1
          className={cn(
            pageTitleStyles,
            "flex justify-between items-center flex-wrap gap-4"
          )}
        >
        </h1>
      </PageHeader>
      <div className={cn("space-y-8 container mx-auto py-12 min-h-screen")}>
      </div>
    </>
  );
}

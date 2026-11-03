import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
  moreHref: string;
  moreLabel: string;
  onPrev?: () => void;
  onNext?: () => void;
};

// Heading row shared by the home-page carousels.
export function SectionHeader({ title, description, moreHref, moreLabel, onPrev, onNext }: Props) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
        <p className="mt-1 text-base text-muted-foreground">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button asChild variant="link" className="px-2">
          <Link href={moreHref}>{moreLabel}</Link>
        </Button>
        {onPrev && (
          <Button variant="outline" size="icon-sm" onClick={onPrev} className="hidden rounded-full md:inline-flex">
            <ChevronLeft className="size-4" />
            <span className="sr-only">Previous</span>
          </Button>
        )}
        {onNext && (
          <Button variant="outline" size="icon-sm" onClick={onNext} className="hidden rounded-full md:inline-flex">
            <ChevronRight className="size-4" />
            <span className="sr-only">Next</span>
          </Button>
        )}
      </div>
    </div>
  );
}

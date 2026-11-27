"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@bloomper/fgv-web-ui/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@bloomper/fgv-web-ui/ui/dialog";
import { PlainText } from "@/components/plain-text";
import type { NewsItem } from "@/components/news/news";
import { formatDate } from "@/utils/format";

/**
 * Published news on the start page, newest first: a card per piece with the start of its text, opened to read it all.
 */
export function NewsList({ news }: { news: NewsItem[] }) {
  const t = useTranslations("News");
  const [reading, setReading] = useState<NewsItem | null>(null);

  return (
    <>
      <ul
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        aria-label={t("latest")}
      >
        {news.map((piece) => (
          <li key={piece.id}>
            <button
              type="button"
              onClick={() => setReading(piece)}
              className="focus-visible:ring-ring h-full w-full rounded-xl text-left outline-none focus-visible:ring-2"
            >
              <Card className="hover:bg-accent h-full transition-colors">
                <CardHeader>
                  <CardDescription>
                    <time dateTime={piece.visibleFrom ?? undefined}>{formatDate(piece.visibleFrom)}</time>
                  </CardDescription>
                  <CardTitle>{piece.subject}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-4 text-sm whitespace-pre-line">{piece.text}</p>
                </CardContent>
              </Card>
            </button>
          </li>
        ))}
      </ul>
      {reading && (
        <Dialog
          open
          onOpenChange={(open) => !open && setReading(null)}
        >
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogDescription>
                <time dateTime={reading.visibleFrom ?? undefined}>{formatDate(reading.visibleFrom)}</time>
              </DialogDescription>
              <DialogTitle>{reading.subject}</DialogTitle>
            </DialogHeader>
            <PlainText
              className="block text-sm"
              text={reading.text}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

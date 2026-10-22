import type {GuideVersionFieldsFragment} from "@/gql/graphql";
import type {NavChapter} from "@/components/guide/guide-chapter-nav.client";

/**
 * What the chapter navigation needs of a version: each chapter's key and title, and its sections'.
 */
export function navChapters(version: GuideVersionFieldsFragment): NavChapter[] {
    return version.chapters.map(chapter => ({
        key: chapter.key,
        title: chapter.title,
        sections: chapter.sections.map(section => ({key: section.key, title: section.title})),
    }));
}

/**
 * Each chapter's number, counting from 1, by key.
 */
export function chapterNumbers(version: GuideVersionFieldsFragment): Record<string, number> {
    return Object.fromEntries(version.chapters.map((chapter, index) => [chapter.key, index + 1]));
}

import "server-only";

import {cache} from "react";
import {getGuideDraft} from "@/lib/guide/guide.server";

/**
 * The draft, once per request, as the chapters' layout and page both need it.
 */
export const loadGuideDraft = cache(getGuideDraft);

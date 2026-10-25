import {graphql} from "@/gql";

export const LibraryEntryFields = graphql(`
    fragment LibraryEntryFields on LibraryEntry {
        id
        kind
        name { sv en }
        description { sv en }
        pros { sv en }
        cons { sv en }
        booking { sv en }
        prices { sv en }
        contact { sv en }
        url
        retired
        version
    }
`);

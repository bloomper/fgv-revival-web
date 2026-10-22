import {graphql} from "@/gql";

export const GuideItemFields = graphql(`
    fragment GuideItemFields on GuideItem {
        id
        key
        type
        text { sv en }
        version
    }
`);

export const GuideVersionFields = graphql(`
    fragment GuideVersionFields on GuideVersion {
        id
        status
        label
        note
        publishedAt
        publishedBy
        version
        basedOn { id label publishedAt }
        introduction { sv en }
        chapters {
            id
            key
            title { sv en }
            version
            items { ...GuideItemFields }
            sections {
                id
                key
                title { sv en }
                version
                items { ...GuideItemFields }
            }
        }
    }
`);

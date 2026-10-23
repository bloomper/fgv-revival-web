import {graphql} from "@/gql";

export const CapabilityFields = graphql(`
    fragment CapabilityFields on Capability {
        id
        name { sv en }
        retired
    }
`);

export const GuideItemTypeFields = graphql(`
    fragment GuideItemTypeFields on GuideItemType {
        id
        kind
        name { sv en }
        retired
    }
`);

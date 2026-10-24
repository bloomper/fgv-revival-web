import {graphql} from "@/gql";

export const LinkServiceFields = graphql(`
    fragment LinkServiceFields on LinkService {
        id
        name { sv en }
        hosts
        homeUrl
        retired
    }
`);

export const MaterialFields = graphql(`
    fragment MaterialFields on Material {
        id
        title
        url
        service { ...LinkServiceFields }
        serviceChosen
        category
        visibility
        positions { ...PositionFields }
        comment
        removed
        version
    }
`);

export const InventoryItemFields = graphql(`
    fragment InventoryItemFields on InventoryItem {
        id
        name
        kind
        quantity
        status
        location
        locationNote
        owner { name person { id displayName active } }
        comment
        material { id title url removed }
        removed
        version
    }
`);

/**
 * The server's ids are UUIDs, so anything else in a path is refused before it reaches the server.
 */
export const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

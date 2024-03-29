import { Event, parseReferences } from "nostr-tools";
import { BayWalletPost, Metadata, Replies, Tags } from "../types/nostr";

/**
 * Given a Kind 0 event, parse the profile.
 * 
 * @param profile {@link Event}
 * @returns {@link Metadata}
 */
export const parseMetadata = (profile: Event): Metadata => {
  const rawContent = JSON.parse(profile.content);
  const metadata: Metadata = {
    name: rawContent.name,
    username: rawContent.username,
    display_name: rawContent.display_name,
    picture: rawContent.picture,
    banner: rawContent.banner,
    about: rawContent.about,
    nip05: rawContent.nip05,
    website: rawContent.website,
    lud06: rawContent.lud06,
    lud16: rawContent.lud16,
    pubkey: profile.pubkey
  };
  return metadata;
}

/**
 * Combines all functions to parse an event for our view.
 * 
 * @param event {@link Event}
 * @returns 
 */
export const parseBayWalletPost = (event: Event): BayWalletPost => {
  const imageUrls = getImageUrls(event);
  const links = getLinks(imageUrls);
  const references = parseMentions(event)
  const tags = parseEventTags(event.tags)

  const bayWalletPost = {
    ...references,
    ...imageUrls,
    ...links,
    eventTags: tags
  }
  
  return bayWalletPost;
}

/**
 * Get any image links in an event.
 * 
 * @param event {@link Event}
 * @returns 
 */
export const getImageUrls = (event: Event): BayWalletPost => {
    const regex = /\bhttps?:\/\/\S+\.(?:png|jpe?g|webp|gif)\b/g;
    const matches = event.content.match(regex);

    if (!matches) return {...event, imageUrls: []};

    const replaceImageUrls = event.content.replaceAll(regex, "").trim();

    const eventWithImageUrls = {
      ...event,
      content: replaceImageUrls,
      imageUrls: matches
    }

    return eventWithImageUrls;
}

/**
 * Get any urls that are referenced in an event.
 * 
 * @param event {@link Event}
 * @returns 
 */
export const getLinks = (event: Event): BayWalletPost => {
  const urlRegex = /\bhttps?:\/\/\S+(?<!\.jpg|\.jpeg|\.png|\.gif|\.webp)\b/g
  const matches = event.content.match(urlRegex);

  if (!matches) return {...event, links: []};
  
  const replaceLinks = event.content.replaceAll(urlRegex, "").trim();

  const eventWithLinks = {
    ...event,
    content: replaceLinks,
    links: matches
  }
  
  return eventWithLinks;
}

/**
 * Parse NIP-27 events.
 * 
 * @param event {@link Event}
 * @returns 
 */
export const parseMentions = (event: Event) => {
  const references = parseReferences(event)

  const post: BayWalletPost = {
    ...event,
    references: references
  }
  return post
}

/**
 * After replies have been retrieved (#e filter to relays), parse the replies and order them by parents and children.
 * 
 * @param focusedEvent {@link Event} The event in view
 * @param replies Replies retrieved from relays
 * @returns 
 */
export const getOrderedReplies = (focusedEvent: Event, replies: Event[]): Replies => {
  if (replies.length === 0) return { parentReplies: [], childReplies: []}
  
  const focusedCreatedAt = focusedEvent.created_at
  
  const parentReplies: Event[] = replies.filter(event => event.created_at < focusedCreatedAt)
  const childReplies: Event[] = replies.filter(event => event.created_at > focusedCreatedAt)

  parentReplies.sort((a, b) => a.created_at - b.created_at);
  childReplies.sort((a, b) => a.created_at - b.created_at);

  const postWithReplies = {
    parentReplies,
    childReplies
  }

  return postWithReplies
}

/**
 * Parses the tags array if there is any linked posts we need.
 * 
 * @param tags {@link Event} Event tags
 * @returns events, pubkeys, and quotes
 */
export const parseEventTags = (tags: string[][]): Tags => {
  return tags.reduce(
    (result, [tag, values]) => {
      if (tag === 'e') {
        result.eTags.push(values);
      } else if (tag === 'p') {
        result.pTags.push(values);
      } else if (tag === 'q') {
        result.qTags.push(values)
      }
      return result;
    },
    { eTags: [], pTags: [], qTags: [] }
  );
}
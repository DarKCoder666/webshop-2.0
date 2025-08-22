import { RichText, TextStyle } from "./builder-types";

/**
 * Utility functions for working with rich text content
 */

export function getRichTextContent(content: string | RichText | undefined): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  return content.text || "";
}

export function getRichTextStyle(content: string | RichText | undefined): TextStyle | undefined {
  if (!content || typeof content === "string") return undefined;
  return content.style;
}

export function createRichText(text: string, style?: TextStyle): RichText {
  return { text, style };
}

export function isRichText(content: any): content is RichText {
  return content && typeof content === "object" && typeof content.text === "string";
}

import { sql } from '@/lib/db';

/**
 * Enhances tags with descriptions from the database
 * @param {Array} words - Array of words with tags
 * @returns {Array} - Words with enhanced tags
 */
export async function enhanceTagsWithDescriptions(words) {
  try {
    // Get all tag descriptions from the database
    const tagResult = await sql`
      SELECT tag_code, description 
      FROM tags 
      ORDER BY tag_code
    `;
    
    // Handle Vercel Postgres client structure
    const tagRows = Array.isArray(tagResult) ? tagResult : tagResult.rows || [];
    
    // Create a map for quick lookup
    const tagDescriptions = {};
    tagRows.forEach(row => {
      tagDescriptions[row.tag_code] = row.description;
    });
    
    // Enhance each word's tags
    return words.map(word => {
      if (!word.tags || !Array.isArray(word.tags)) {
        return word;
      }
      
      const enhancedTags = word.tags.map(tag => {
        if (typeof tag === 'string') {
          // If tag is just a string, create an object
          return {
            tag: tag,
            description: tagDescriptions[tag] || ''
          };
        } else if (tag.tag) {
          // If tag is already an object, enhance it
          return {
            ...tag,
            description: tag.description || tagDescriptions[tag.tag] || ''
          };
        }
        return tag;
      });
      
      return {
        ...word,
        tags: enhancedTags
      };
    });
  } catch (error) {
    console.error('Error enhancing tags:', error);
    // Return original words if enhancement fails
    return words;
  }
}

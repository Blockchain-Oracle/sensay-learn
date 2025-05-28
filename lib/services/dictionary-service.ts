import axios from 'axios';

export interface WordDefinition {
  word: string;
  phonetic?: string;
  audioUrl?: string;
  definitions: {
    partOfSpeech: string;
    definition: string;
    example?: string;
    synonyms?: string[];
  }[];
  language: string;
}

interface FreeDictionaryResponse {
  word: string;
  phonetic?: string;
  phonetics: {
    text?: string;
    audio?: string;
  }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms?: string[];
    }[];
  }[];
  sourceUrls?: string[];
}

// This service uses the Free Dictionary API to fetch word definitions, examples, and audio pronunciations
// More info: https://dictionaryapi.dev/
export class DictionaryService {
  private BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries';

  // Dictionary API supports: English (en), Hindi (hi), Spanish (es), French (fr), 
  // Japanese (ja), Russian (ru), German (de), Italian (it), Korean (ko), Brazilian Portuguese (pt-BR),
  // Turkish (tr), Arabic (ar), Tamil (ta)
  public async getDefinition(word: string, language = 'en'): Promise<WordDefinition | null> {
    try {
      const response = await axios.get<FreeDictionaryResponse[]>(
        `${this.BASE_URL}/${language}/${encodeURIComponent(word.toLowerCase())}`
      );
      
      if (!response.data || response.data.length === 0) {
        return null;
      }
      
      const data = response.data[0];
      
      // Find the first valid audio URL
      const audioUrl = data.phonetics.find((p: { audio?: string }) => p.audio && p.audio.length > 0)?.audio;
      
      // Map the response to our interface
      const result: WordDefinition = {
        word: data.word,
        phonetic: data.phonetic || data.phonetics.find((p: { text?: string }) => p.text)?.text,
        audioUrl,
        definitions: [],
        language
      };
      
      // Extracting definitions
      data.meanings.forEach((meaning: { partOfSpeech: string; definitions: any[] }) => {
        meaning.definitions.forEach((def: { definition: string; example?: string; synonyms?: string[] }) => {
          result.definitions.push({
            partOfSpeech: meaning.partOfSpeech,
            definition: def.definition,
            example: def.example,
            synonyms: def.synonyms
          });
        });
      });
      
      return result;
    } catch (error) {
      console.error('Error fetching word definition:', error);
      return null;
    }
  }
  
  // Alternative method using AI for languages not supported by the dictionary API
  public async getAIDefinition(word: string, language: string, targetLanguage = 'en'): Promise<WordDefinition | null> {
    try {
      // This would typically call your AI service API endpoint
      // For now, it's a placeholder that returns null
      console.log(`AI definition requested for ${word} in ${language} translated to ${targetLanguage}`);
      return null;
    } catch (error) {
      console.error('Error fetching AI definition:', error);
      return null;
    }
  }
  
  // Method to get example sentences for a word
  public async getExampleSentences(word: string, language = 'en'): Promise<string[]> {
    try {
      const definition = await this.getDefinition(word, language);
      if (!definition) return [];
      
      // Extract examples from definitions
      return definition.definitions
        .filter(def => def.example)
        .map(def => def.example as string);
    } catch (error) {
      console.error('Error fetching example sentences:', error);
      return [];
    }
  }
  
  // Helper method to get the TTS-friendly pronunciation of a word
  public getPronunciation(word: string, phonetic?: string): string {
    if (!phonetic) return word;
    
    // Clean up the phonetic notation to make it more TTS-friendly
    return phonetic
      .replace(/[\/\[\]]/g, '') // Remove slashes and brackets
      .replace(/ˈ/g, '') // Remove stress marks
      .replace(/ˌ/g, '')
      .trim();
  }
}

export const dictionaryService = new DictionaryService(); 
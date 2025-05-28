import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ArrowLeft, BookOpen, Search, Plus } from "lucide-react"
import useVocabulary from "@/hooks/use-vocabulary"
import VocabularyCard from "@/components/study-buddy/vocabulary-card"
import VocabularyInput from "@/components/study-buddy/vocabulary-input"

interface VocabularyManagerProps {
  language: string
  onBack: () => void
  onPractice: () => void
  darkMode?: boolean
}

export default function VocabularyManager({
  language,
  onBack,
  onPractice,
  darkMode = false,
}: VocabularyManagerProps) {
  const [currentTab, setCurrentTab] = useState("all")
  const [searchInput, setSearchInput] = useState("")
  const [showAddWord, setShowAddWord] = useState(false)
  
  const {
    words,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    searchResults,
    filteredWords,
    wordsByCategory,
    addWord,
    toggleFavorite,
    toggleMastered,
    lookupWord,
  } = useVocabulary()
  
  // Get words for the current language
  const languageWords = words.filter(word => 
    word.language.toLowerCase() === language.toLowerCase()
  )
  
  // Get filtered words based on current tab
  const getDisplayWords = () => {
    if (searchTerm) {
      return searchResults.filter(word => 
        word.language.toLowerCase() === language.toLowerCase()
      )
    }
    
    if (currentTab === 'all') {
      return languageWords
    }
    
    if (currentTab === 'favorites') {
      return filteredWords('favorites').filter(word => 
        word.language.toLowerCase() === language.toLowerCase()
      )
    }
    
    if (currentTab === 'mastered') {
      return filteredWords('mastered').filter(word => 
        word.language.toLowerCase() === language.toLowerCase()
      )
    }
    
    if (currentTab === 'recent') {
      return filteredWords('recent').filter(word => 
        word.language.toLowerCase() === language.toLowerCase()
      )
    }
    
    // If current tab is a category
    return languageWords.filter(word => 
      word.category?.toLowerCase() === currentTab.toLowerCase()
    )
  }
  
  // Get unique categories for this language
  const categories = Array.from(
    new Set(languageWords.map(word => word.category || 'Uncategorized'))
  )
  
  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchTerm(searchInput)
  }
  
  // Handle clearing search
  const handleClearSearch = () => {
    setSearchTerm("")
    setSearchInput("")
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
          <h2 className={`text-lg font-semibold ${darkMode ? "text-white" : ""}`}>
            Vocabulary Manager
          </h2>
        </div>
        
        <Button size="sm" onClick={onPractice}>
          Practice Flashcards
        </Button>
      </div>
      
      {/* Search bar and Add button */}
      <div className="flex space-x-2">
        <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search vocabulary..."
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
          {searchTerm && (
            <Button type="button" variant="ghost" onClick={handleClearSearch}>
              Clear
            </Button>
          )}
        </form>
        
        <Button onClick={() => setShowAddWord(!showAddWord)}>
          {showAddWord ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> Add Word</>}
        </Button>
      </div>
      
      {/* Word input form */}
      {showAddWord && (
        <VocabularyInput
          onAddWord={addWord}
          onLookupWord={lookupWord}
          loading={loading}
          language={language}
          darkMode={darkMode}
        />
      )}
      
      {/* Search results info */}
      {searchTerm && (
        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Found {searchResults.length} results for "{searchTerm}"
        </div>
      )}
      
      {/* Tabs for categories */}
      <Tabs 
        defaultValue="all" 
        value={currentTab}
        onValueChange={(value) => {
          setCurrentTab(value)
          handleClearSearch()
        }}
      >
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="all">
            All ({languageWords.length})
          </TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites ({filteredWords('favorites').filter(w => w.language.toLowerCase() === language.toLowerCase()).length})
          </TabsTrigger>
          <TabsTrigger value="mastered">
            Mastered ({filteredWords('mastered').filter(w => w.language.toLowerCase() === language.toLowerCase()).length})
          </TabsTrigger>
          <TabsTrigger value="recent">
            Recent
          </TabsTrigger>
          
          {/* Category tabs */}
          {categories.map((category) => (
            <TabsTrigger key={category} value={category.toLowerCase()}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Tab content */}
        <TabsContent value={currentTab} className="space-y-4">
          {getDisplayWords().length > 0 ? (
            getDisplayWords().map((word) => (
              <VocabularyCard
                key={word.id}
                word={word.word}
                translation={word.translation}
                category={word.category}
                pronunciation={word.pronunciation}
                language={word.language}
                mastered={word.mastered}
                favorite={word.favorite}
                definitions={word.definition}
                darkMode={darkMode}
                onToggleFavorite={() => toggleFavorite(word.id)}
                onToggleMastered={() => toggleMastered(word.id)}
              />
            ))
          ) : (
            <Card className={darkMode ? "bg-gray-800 border-gray-700" : ""}>
              <CardContent className="p-6 text-center">
                <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  {searchTerm 
                    ? `No results found for "${searchTerm}"`
                    : currentTab === 'all'
                      ? 'No vocabulary words found. Add some words to get started!'
                      : `No words found in this category.`
                  }
                </p>
                
                {!searchTerm && currentTab === 'all' && (
                  <Button className="mt-4" onClick={() => setShowAddWord(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Word
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Loading state */}
      {loading && (
        <div className={`text-center py-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Loading...
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className={`text-center py-4 text-red-500`}>
          {error}
        </div>
      )}
    </div>
  )
} 
const fs = require('fs')
const path = require('path')

class PromptManager {
  constructor() {
    this.promptFilePath = path.join(__dirname, '..', 'data', 'used-prompts.json')
    this.usedPrompts = this.loadUsedPrompts()
  }

  loadUsedPrompts() {
    try {
      if (fs.existsSync(this.promptFilePath)) {
        const data = fs.readFileSync(this.promptFilePath, 'utf8')
        return JSON.parse(data)
      }
      return { ja: [], en: [], th: [] }
    } catch (error) {
      console.warn('Failed to load used prompts:', error.message)
      return { ja: [], en: [], th: [] }
    }
  }

  saveUsedPrompts() {
    try {
      const dir = path.dirname(this.promptFilePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.promptFilePath, JSON.stringify(this.usedPrompts, null, 2), 'utf8')
    } catch (error) {
      console.error('Failed to save used prompts:', error.message)
    }
  }

  getNextAvailablePrompt(language, prompts) {
    const usedIndexes = this.usedPrompts[language] || []
    
    // Find first unused prompt
    for (let i = 0; i < prompts.length; i++) {
      if (!usedIndexes.includes(i)) {
        // Mark as used
        this.usedPrompts[language].push(i)
        this.saveUsedPrompts()
        
        console.log(`📝 Selected unused prompt index: ${i} for ${language}`)
        console.log(`📊 Used prompts for ${language}: ${this.usedPrompts[language].length}/${prompts.length}`)
        
        return { index: i, prompt: prompts[i] }
      }
    }
    
    // All prompts used, reset and use first one
    console.log(`🔄 All prompts used for ${language}, resetting...`)
    this.usedPrompts[language] = [0]
    this.saveUsedPrompts()
    
    return { index: 0, prompt: prompts[0] }
  }

  getUsedPromptsCount(language) {
    return (this.usedPrompts[language] || []).length
  }

  resetUsedPrompts(language = null) {
    if (language) {
      this.usedPrompts[language] = []
    } else {
      this.usedPrompts = { ja: [], en: [], th: [] }
    }
    this.saveUsedPrompts()
  }
}

module.exports = PromptManager
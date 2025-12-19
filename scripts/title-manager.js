const fs = require('fs')
const path = require('path')

class TitleManager {
  constructor() {
    this.titleFilePath = path.join(__dirname, '..', 'data', 'used-titles.json')
    this.usedTitles = this.loadUsedTitles()
  }

  loadUsedTitles() {
    try {
      if (fs.existsSync(this.titleFilePath)) {
        const data = fs.readFileSync(this.titleFilePath, 'utf8')
        return JSON.parse(data)
      }
      return []
    } catch (error) {
      console.warn('Failed to load used titles:', error.message)
      return []
    }
  }

  saveUsedTitles() {
    try {
      fs.writeFileSync(this.titleFilePath, JSON.stringify(this.usedTitles, null, 2), 'utf8')
    } catch (error) {
      console.error('Failed to save used titles:', error.message)
    }
  }

  isTitleUsed(title) {
    return this.usedTitles.includes(title)
  }

  addTitle(title) {
    if (!this.isTitleUsed(title)) {
      this.usedTitles.push(title)
      this.saveUsedTitles()
      return true
    }
    return false
  }

  generateUniqueTitle(baseTitle, maxAttempts = 10) {
    if (!this.isTitleUsed(baseTitle)) {
      this.addTitle(baseTitle)
      return baseTitle
    }

    for (let i = 1; i <= maxAttempts; i++) {
      const modifiedTitle = `${baseTitle} (${i})`
      if (!this.isTitleUsed(modifiedTitle)) {
        this.addTitle(modifiedTitle)
        return modifiedTitle
      }
    }

    // If all attempts failed, add timestamp
    const timestampTitle = `${baseTitle} - ${new Date().toISOString().split('T')[0]}`
    this.addTitle(timestampTitle)
    return timestampTitle
  }

  getUsedTitlesCount() {
    return this.usedTitles.length
  }

  clearAllTitles() {
    this.usedTitles = []
    this.saveUsedTitles()
  }
}

module.exports = TitleManager
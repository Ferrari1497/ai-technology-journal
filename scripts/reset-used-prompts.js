const PromptManager = require('./prompt-manager')

function resetUsedPrompts() {
  console.log('🔄 Resetting used prompts...')
  
  const promptManager = new PromptManager()
  
  // Reset all languages
  promptManager.resetUsedPrompts()
  
  console.log('✅ All used prompts have been reset')
  console.log('📊 Used prompts count:')
  console.log(`   - ja: ${promptManager.getUsedPromptsCount('ja')}`)
  console.log(`   - en: ${promptManager.getUsedPromptsCount('en')}`)
  console.log(`   - th: ${promptManager.getUsedPromptsCount('th')}`)
}

// 実行
if (require.main === module) {
  resetUsedPrompts()
}

module.exports = { resetUsedPrompts }
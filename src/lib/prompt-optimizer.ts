import { AnalysisResult } from './analytics'

export interface OptimizedPrompt {
  basePrompt: string
  category: string
  keywords: string[]
  wordCount: number
  structure: string[]
  seoOptimizations: string[]
}

export class PromptOptimizer {
  generateOptimizedPrompt(analysis: AnalysisResult, category?: string): OptimizedPrompt {
    const targetCategory = category || analysis.topCategories[0] || '生成AIツール比較'
    const keywords = analysis.bestKeywords.slice(0, 5)
    const wordCount = analysis.optimalWordCount

    const basePrompt = this.buildBasePrompt(targetCategory, keywords, wordCount, analysis)
    const structure = this.getOptimalStructure(analysis)
    const seoOptimizations = this.getSEOOptimizations(analysis)

    return {
      basePrompt,
      category: targetCategory,
      keywords,
      wordCount,
      structure,
      seoOptimizations
    }
  }

  private buildBasePrompt(category: string, keywords: string[], wordCount: number, analysis: AnalysisResult): string {
    const trendingTopics = analysis.trendingTopics.join('、')
    const successPatterns = analysis.successPatterns.join('\n- ')

    return `
あなたは日本のAI技術専門ライターです。以下の最適化データに基づいて高品質な記事を作成してください。

## 記事要件
- カテゴリ: ${category}
- 文字数: 約${wordCount}文字
- 対象キーワード: ${keywords.join('、')}
- トレンドトピック: ${trendingTopics}

## 最適化指針
過去のデータ分析結果に基づく成功パターン:
- ${successPatterns}

## 記事構成要件
1. SEO最適化されたタイトル（60文字以内）
2. 魅力的な導入部（120-160文字の要約含む）
3. 見出し構造（H2、H3を適切に使用）
4. 実用的な情報と具体例
5. 収益化要素の自然な組み込み
6. まとめと行動喚起

## 品質基準
- 読みやすさ: 一文50文字以内
- 専門性: 正確な技術情報
- 実用性: 読者の課題解決
- SEO: キーワードの自然な配置（密度2-3%）

## 収益化要素
- アフィリエイトリンク挿入箇所の提案
- 比較表での製品紹介
- 具体的な料金情報
- 導入事例の紹介

この指針に従って、読者にとって価値があり、検索エンジンに最適化された記事を作成してください。
    `.trim()
  }

  private getOptimalStructure(analysis: AnalysisResult): string[] {
    // 成功パターンに基づく構造最適化
    const baseStructure = [
      '# タイトル（SEO最適化済み）',
      '## 導入・概要',
      '## 主要機能・特徴',
      '## 料金・プラン比較',
      '## 実際の使用感・レビュー',
      '## 競合との比較',
      '## 導入事例・活用方法',
      '## まとめ・推奨アクション'
    ]

    // トレンドトピックがある場合は構造を調整
    if (analysis.trendingTopics.length > 0) {
      baseStructure.splice(2, 0, `## ${analysis.trendingTopics[0]}の最新動向`)
    }

    return baseStructure
  }

  private getSEOOptimizations(analysis: AnalysisResult): string[] {
    const optimizations = [
      'タイトルに主要キーワードを含める',
      'メタディスクリプションを120-160文字で作成',
      '見出しタグ（H2、H3）を適切に使用',
      '内部リンクを2-3箇所に設置',
      '画像にalt属性を設定'
    ]

    // 改善エリアに基づく追加最適化
    if (analysis.improvementAreas.includes('SEOスコア改善が必要')) {
      optimizations.push('キーワード密度を2-3%に調整')
      optimizations.push('関連キーワードを自然に配置')
    }

    if (analysis.improvementAreas.includes('直帰率が高い')) {
      optimizations.push('冒頭で読者の課題を明確化')
      optimizations.push('目次を設置して構造を明示')
    }

    return optimizations
  }

  // A/Bテスト用のバリエーション生成
  generateVariations(basePrompt: OptimizedPrompt, count: number = 2): OptimizedPrompt[] {
    const variations = []

    for (let i = 0; i < count; i++) {
      const variation = { ...basePrompt }
      
      // タイトルアプローチを変更
      if (i === 0) {
        variation.basePrompt = variation.basePrompt.replace(
          'SEO最適化されたタイトル',
          '感情に訴えるキャッチーなタイトル'
        )
      } else if (i === 1) {
        variation.basePrompt = variation.basePrompt.replace(
          'SEO最適化されたタイトル',
          '数字や具体性を重視したタイトル'
        )
      }

      variations.push(variation)
    }

    return variations
  }
}
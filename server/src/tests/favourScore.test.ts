import { describe, it, expect } from 'vitest'
import { FavourScoreService } from '../services/favourScore.service.js'

describe('FavourScoreService.calculate', () => {
  it('calculates weighted score correctly', () => {
    const score = FavourScoreService.calculate({
      responseRate: 1.0,
      completionRate: 1.0,
      reviewAverage: 1.0,
      recency: 1.0,
    })
    expect(score).toBeCloseTo(1.0)
  })

  it('weights completionRate most heavily', () => {
    const highCompletion = FavourScoreService.calculate({
      responseRate: 0,
      completionRate: 1.0,
      reviewAverage: 0,
      recency: 0,
    })
    const highResponse = FavourScoreService.calculate({
      responseRate: 1.0,
      completionRate: 0,
      reviewAverage: 0,
      recency: 0,
    })
    expect(highCompletion).toBeGreaterThan(highResponse)
  })

  it('normalises review average from 1-5 to 0-1', () => {
    const score = FavourScoreService.calculate({
      responseRate: 0,
      completionRate: 0,
      reviewAverage: 5,
      recency: 0,
    })
    expect(score).toBeCloseTo(0.30)
  })
})

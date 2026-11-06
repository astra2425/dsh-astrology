/** Shared reactive label state for the primary workspace Astrology brand. */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-store'

export interface AstrologyBrandState { chinese: string; english: string }
type AstrologyBrandActions = { sync: (draft: AstrologyBrandState, chinese: string, english: string) => void }

export function createAstrologyBrandStore(): EngineStoreHandle<AstrologyBrandState, AstrologyBrandActions> {
  return defineStore({
    init: (): AstrologyBrandState => ({ chinese: '星术', english: 'ASTROLOGY' }),
    actions: { sync: (draft, chinese: string, english: string) => { draft.chinese = chinese; draft.english = english } },
  })
}

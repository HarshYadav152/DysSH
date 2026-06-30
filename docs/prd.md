# Product Requirements Document
## Luminary — An AI Reading & Learning Companion for Dyslexic Learners

**Status:** Draft v1.0
**Owner:** [Product Owner]
**Last updated:** June 30, 2026

---

## 1. Background & Problem Statement

Dyslexia affects an estimated 15–20% of school-aged readers, primarily disrupting phonological decoding rather than vision itself. The core problem these readers face isn't comprehension capacity — it's that decoding text consumes so much working memory that little is left for understanding or enjoying it.

Most existing tools (Microsoft Immersive Reader, Speechify, Natural Reader, Voice Dream, DyslexiaBuddy, Lexy, KOBI, Readability) cluster around two patterns: (1) general-purpose text-to-speech/OCR readers aimed at adults and students who already read independently, and (2) structured-literacy phonics tutors aimed at young children learning to decode. Few products bridge both — pairing real-time AI comprehension support (summarizing, simplifying, defining) with active fluency coaching (listening to a child read aloud and giving corrective feedback) inside one calm, low-friction interface.

Luminary's opportunity is to be a daily-use companion that reduces decoding load in the moment (so a student can get through today's homework or a book) while also building durable reading skill over time, wrapped in an interface explicitly designed around what actually helps dyslexic readers rather than around popular but evidence-weak gimmicks.

## 2. Research Summary

### 2.1 Competitive landscape

| Product | Core mechanic | Audience | Notable gap |
|---|---|---|---|
| Microsoft Immersive Reader | Free TTS, line focus, syllable split, picture dictionary | Schools (M365) | No personalization, no progress tracking, not standalone |
| Speechify / Natural Reader | TTS + OCR scanning of any text | Teens/adults | Comprehension support is shallow; not designed for young readers |
| Voice Dream Reader/Writer | TTS reading with synced highlighting | Students | Paid, dated UI, no AI tutoring |
| DyslexiaBuddy | TTS + OCR + AI word definitions/summaries | Families, K-12 | AI tutor is a premium add-on, not core experience |
| Lexy (Dyslexia.ai) | Voice-based phonics coaching, multisensory letter tracing | Young children | Narrow to early phonics; not a general reading companion |
| KOBI | Real-time speech-recognition feedback during oral reading practice | K-4 | Structured-literacy supplement, not a flexible everyday reader |
| Readability Tutor | AI listens to oral reading, gives real-time pronunciation feedback | K-12 | Subscription-gated; classroom/tutoring framing over self-serve app |

The pattern: nobody has combined "read anything, right now, with less strain" (the TTS/OCR category) with "get better at reading over time" (the phonics-coaching category) in a single lightweight, AI-native product. That combination is Luminary's wedge.

### 2.2 What the evidence actually supports

This matters because several popular interventions are weaker than their marketing suggests, and the PRD should not build features that don't hold up:

- **Dyslexia-specific fonts (OpenDyslexic, Dyslexie) have not been shown to improve reading speed or accuracy** in controlled studies — multiple trials found mainstream fonts like Arial or Times New Roman performed equally well or better, and dyslexic readers did not prefer the specialty fonts. Luminary should offer font choice as a *comfort/preference* setting, not market it as a clinically-proven fix.
- **Synchronized read-aloud with word-level highlighting** (hearing + seeing the word at once) is well supported as "assisted reading" that reinforces word recognition over time — this is a core mechanic worth investing in, not a cosmetic feature.
- **Increased letter/word/line spacing** has research support (Zorzi et al., PNAS 2012) for improving reading speed independent of font choice — spacing controls are worth more product investment than font-shape gimmicks.
- **Explicit, systematic phonics** remains the evidence-based backbone for building decoding skill long-term; an AI companion that only offers TTS/summarization without ever building underlying skill risks becoming a permanent crutch rather than a bridge to independence.
- **Real-time speech-recognition feedback on oral reading** (catching mispronunciations, gently correcting) is the feature most users credit with actual skill improvement, not just convenience — and it's the hardest to build well (children's speech recognition, including speech variability, is technically harder than adult ASR).

### 2.3 Regulatory/trust constraints surfaced by research

Any product touching children's reading data and (likely) microphone audio must account for COPPA, FERPA (if sold into schools), and GDPR-style data minimization from day one — multiple competitors lead with "ad-free," "no data selling," and compliance badges as core trust signals, suggesting this is a purchase-decision factor for parents, not a backend afterthought.

## 3. Goals

### 3.1 Product goals
- Reduce the decoding burden in everyday reading tasks (homework, books, articles) so users can focus on meaning.
- Build durable reading fluency over time through short, low-pressure practice sessions — not just provide a permanent accessibility crutch.
- Make the experience calm and shame-free: dyslexic users frequently arrive with reading-related anxiety, and UI/tone choices should actively counter that.

### 3.2 Business goals
- Validate a freemium model: free core reading support (TTS, OCR, customization) with paid AI tutoring/summarization/advanced voices, consistent with the market's dominant pricing pattern.
- Reach initial product-market fit with parents of K-8 children before expanding to teens/adults or B2B school licensing.

### 3.3 Non-goals (v1)
- Not a clinical diagnostic tool — Luminary does not assess or diagnose dyslexia.
- Not a full structured-literacy curriculum replacement (e.g., not competing head-on with Orton-Gillingham programs like Nessy for systematic phonics instruction).
- No classroom/teacher dashboard or LMS integration in v1 — consumer/family-first.

## 4. Target Users & Personas

**Primary: Parent of a struggling reader (ages 7–12).** Has tried flashcards/tutors with limited success; wants something the child will actually want to use daily; cares deeply about privacy and ad-free design; price-sensitive but will pay for visible progress.

**Secondary: The child/student themself (age 7–14).** Wants reading to stop being stressful; responds to warm, non-judgmental encouragement; needs short sessions (10–20 minutes) and visible small wins, not long structured drills.

**Tertiary (future): Teens/adults with dyslexia** managing schoolwork or professional reading independently — primarily want fast TTS/OCR/summarization rather than fluency coaching.

## 5. Core User Stories (v1 scope)

1. As a parent, I can set up my child's profile (age, reading level, font/spacing/voice preferences) in under 3 minutes.
2. As a child, I can point my camera at a worksheet or book page and have it read aloud to me with each word highlighted as it's spoken.
3. As a child, I can read a passage aloud myself and have the app gently flag words I struggled with, without making me feel bad about it.
4. As a child, I can tap any word to hear it sounded out or see a simple definition/picture.
5. As a child, I can ask for a hard paragraph to be explained more simply.
6. As a parent, I can see a simple weekly summary of what my child read, how long they practiced, and which sounds/words are still tricky — not a wall of data.
7. As a child, I get warm, specific encouragement after sessions, with visible progress (streaks, levels) — never punitive framing for mistakes.

## 6. Feature Requirements

### 6.1 MVP (Phase 1)

**Read-to-me (TTS + OCR)**
- Camera-based OCR for printed pages/worksheets; paste/import for digital text and PDFs.
- Natural-sounding TTS with synchronized word-by-word highlighting.
- Adjustable speed (0.7x–1.5x), at least 2 voice options at launch.

**Reading customization**
- Font choice (system-legible fonts as default, optional specialty fonts available but not default-recommended, per research above).
- Adjustable letter/word/line spacing, text size, background/text color contrast, line-focus mode (dim all but 1–3 active lines).

**AI comprehension support**
- Tap-to-define any word (simple, age-appropriate definition, powered by Gemini).
- "Explain this more simply" — AI rewrites a selected passage at a lower reading level while preserving meaning.
- Short AI-generated summary of imported text/PDF.

**Oral reading practice (core differentiator)**
- Child reads a short passage aloud; app uses speech recognition to detect skipped/mispronounced words.
- Gentle, real-time corrective feedback (not red-flag/error-shaming UI — soft highlight + supportive replay of the correct pronunciation).
- Session-end encouragement summary ("You nailed every word with the 'ee' sound today!").

**Parent dashboard (lightweight)**
- Weekly summary: minutes practiced, passages completed, recurring tricky words/sounds.
- No granular per-mistake transcript exposed by default (avoid making the child feel surveilled).

**Trust & safety baseline**
- Ad-free, no data selling, clear age-appropriate privacy policy, COPPA-compliant data handling, parental consent flow for any account tied to a child under 13.

### 6.2 Phase 2 (post-MVP)

- Expanded voice library and accent options.
- Vocabulary/word-bank review system (spaced repetition on a child's personal "tricky words" list).
- Gamified progress system (levels, streaks, optional rewards) — designed carefully to motivate without creating performance anxiety.
- Picture-dictionary mode for younger/more severe readers.
- Translation/bilingual word support.

### 6.3 Phase 3 (expansion)

- Teen/adult mode: faster, more utilitarian TTS/OCR/summarization flow without the coaching layer (closer to a Speechify/Natural Reader use case).
- School/educator pilot: lightweight teacher view, FERPA-compliant data handling, possible IEP documentation export.
- Writing support companion (voice-to-text drafting + dyslexia-aware grammar/spelling assistance), addressing the writing side of dyslexia that v1 doesn't cover.

## 7. Success Metrics

- **Engagement:** % of users completing ≥3 reading sessions/week; median session length (target 10–20 min, matching research-backed routine length).
- **Skill outcome proxy:** reduction in flagged "tricky words" per passage over an 8-week period for returning users.
- **Retention:** Week-4 and Week-12 retention of child profiles.
- **Trust/conversion:** free-to-paid conversion rate; parent NPS, with privacy/trust explicitly probed.
- **Quality bar for AI features:** OCR accuracy rate on real-world printed material; false-correction rate in oral reading feedback (a known failure mode in competitor reviews — ASR misreading a child's accurate reading as an error is highly damaging to trust and must be tracked closely).

## 8. Technical Considerations

- **AI backbone:** Gemini (multimodal) for OCR/text extraction, simplification, definitions, and summarization — consistent with the existing DysSH/Luminary codebase's `GEMINI_API_KEY` dependency.
- **Speech recognition:** Children's speech recognition is materially harder than adult ASR (developing phonology, speech variability); this should be treated as the highest-risk technical component and prototyped/tested earliest, not bolted on late.
- **Architecture:** Lightweight client (current stack: React + TypeScript + Vite) calling a thin services layer to Gemini; on-device processing should be considered for word definitions/OCR where feasible to reduce latency and support offline/low-bandwidth use, a pattern competitors highlight as a premium differentiator.
- **Data handling:** Minimize retention of raw audio from oral-reading sessions; store only derived signals (flagged words, accuracy trends) needed for the parent dashboard, not full recordings, by default.

## 9. Risks & Open Questions

- **ASR reliability for children's speech** is the single biggest execution risk — a tool that wrongly corrects a child who read correctly will quickly erode trust (this surfaced as a real complaint pattern for at least one competitor).
- **Font/feature credibility:** marketing should avoid overstating specialty-font benefits given the weak evidence base; over-claiming risks credibility with informed parents and educators.
- **Scope discipline:** the temptation to become a full structured-literacy curriculum (competing with Orton-Gillingham-based programs) should be resisted in v1 — Luminary's wedge is the combination of in-the-moment support and lightweight coaching, not full curriculum replacement.
- **Open question:** Does v1 charge a flat subscription or freemium-with-paid-AI-tier? Market precedent supports freemium (core TTS/OCR free, AI tutor/summaries paid).
- **Open question:** How much parent-facing detail is appropriate before it feels like surveillance to the child user?

## 10. Appendix: Key Sources Consulted

- Dyslexia UK, "Top AI-Powered Apps Revolutionising Reading for Dyslexic Learners (2026 Guide)"
- DyslexiaBuddy comparison guide and App Store listing (Onlabs)
- KidsAITools, "AI Tools for Kids with Dyslexia: 9 Reading & Writing Aids (2026)"
- EdTech Innovation Hub, coverage of KOBI's U.S. launch
- Dyslexia.ai (Lexy) product site
- ReadabilityTutor.com guides on dyslexia reading apps
- Wery & Diliberto (2016), *Annals of Dyslexia* — OpenDyslexic font study
- Edutopia / Australian Dyslexia Association summaries of font-effectiveness research
- Zorzi et al. (2012), *PNAS* — letter spacing and reading speed in dyslexia

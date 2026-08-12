/* eslint-disable */
/**
 * fullArticles.js — extracted from LandingPage.jsx for maintainability.
 * Edit this file when adding/updating data; it's the canonical source.
 */

import { ARTICLES_PART_1 } from './articlesPart1.js'
import { ARTICLES_PART_2 } from './articlesPart2.js'
import { ARTICLES_PART_3 } from './articlesPart3.js'
import { ARTICLES_PART_4 } from './articlesPart4.js'
import { ARTICLES_PART_5 } from './articlesPart5.js'
import { ARTICLES_PART_6 } from './articlesPart6.js'
import { ARTICLES_PART_7 } from './articlesPart7.js'

export const FULL_ARTICLES = {
  ...ARTICLES_PART_1,
  ...ARTICLES_PART_2,
  ...ARTICLES_PART_3,
  ...ARTICLES_PART_4,
  ...ARTICLES_PART_5,
  ...ARTICLES_PART_6,
  ...ARTICLES_PART_7,
}

# Website releases

What each production deploy of the website (Netlify, from `master`) carries,
so a missed deploy can be spotted and checked page by page.

## 18 October 2026 — re-deploy of PRs #51, #52 and #53

Production deploys stopped after PR #50 (a Netlify billing hold), so these
three merged pull requests did not go live when merged. This deploy
publishes all of them.

| PR | What changes on the site | Check |
|----|--------------------------|-------|
| #51 | Country and city page titles and descriptions fit search results; city titles read "Online School & Homeschool in <city>"; Hong Kong title and description; Hong Kong on the home page; country pages link to their guides | `/homeschool-hong-kong-cn` title "Online School & Homeschool in Hong Kong \| Smartious" |
| #52 | The OSSD partner school is no longer named ("through our Ontario partner school"); USA and Canada page headings "Online School & Homeschool in the USA / Canada"; US and Canadian city titles | `/online-school/malaysia` has no partner name |
| #53 | Learning Centre: photo gallery, "A modern science laboratory", "Two centres in Nairobi" | `/services/learning-centre`; `/centre/smartious-science-laboratory.webp` loads |

Backend change in #51 (Render, not Netlify): closing every lesson is required
from Monday 19 October 2026.

Note: Netlify builds from `frontend/` and skips a build when nothing under
it changed, so a docs-only merge does not deploy. PR #55 carries a small
`frontend/` change (two Luxembourg descriptions, which were duplicates in
search results) so the production build runs.

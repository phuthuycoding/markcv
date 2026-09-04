# Le Hoang Nam

**Address:** Cau Giay, Hanoi  ·  Vietnamese (native), English (professional)

**Date of Birth:** 12/03/1993

**Phone:** 0912 345 678

**Email:** nam.le@example.com

**Website:** example.dev

**GitHub:** github.com/example

***

## OBJECTIVE

**Full-Stack Engineer** with 9 years across web and mobile, most recently on an e-commerce platform serving merchants across Southeast Asia. Comfortable owning a feature end to end — schema, API, front-end, and the dashboard the support team uses afterwards. Looking for a senior role where I keep writing code rather than moving to full-time management.

***

## PROJECT HIGHLIGHTS

### Merchant Onboarding — 6 Days to 40 Minutes

Signing up a merchant took **6 days** because three teams passed a spreadsheet between them for document checks. Rebuilt it as a self-serve flow: **Next.js** front-end, **NestJS** API, document OCR queued through **RabbitMQ**, with a review dashboard for the cases OCR could not settle. Median onboarding fell to **40 minutes**, and **72%** of merchants now finish without anyone from operations touching the case.

### Order Search That Stopped Timing Out

Support staff searched orders with a `LIKE` query across three joined tables; past **8M rows** it timed out and they resorted to asking engineers. Moved search to **Elasticsearch** with a change-data-capture pipeline off **Postgres**, keeping the index within **2 seconds** of the write. p95 search dropped from **11s to 240ms**, and engineer interruptions for lookups went to roughly zero.

***

## WORK EXPERIENCE

### Saigon Commerce Platform

**Senior Full-Stack Engineer** | Feb 2021 - Present

* Build merchant-facing features end to end: **TypeScript**, **NestJS**, **Next.js**, **PostgreSQL**.
* Own the onboarding and order-search domains, including their on-call.
* Introduced **Playwright** end-to-end tests for the checkout path, catching **3 release-blocking regressions** in the first quarter.
* Review code for a team of **7** and mentor two junior engineers.

### Hanoi Digital Solutions

**Full-Stack Developer** | Jun 2017 - Jan 2021

* Delivered web and mobile products for clients using **React**, **React Native** and **Laravel**.
* Built a booking system handling **~15k reservations/month** for a hotel group.
* Set up the team's first CI pipeline with **GitLab CI**, replacing manual FTP deploys.

### Bright Web Studio

**Web Developer** | Aug 2015 - May 2017

* Built WordPress and Laravel sites for small businesses, front-end through deployment.
* Handled hosting, domains, and client support.

***

## SKILLS

### Frontend

*   **Frameworks:** React, Next.js, TypeScript, Tailwind CSS.
*   **Mobile:** React Native (iOS & Android).

### Backend

*   **Languages:** TypeScript (NestJS), PHP (Laravel), some Go.
*   **Data:** PostgreSQL, MySQL, Redis, Elasticsearch, RabbitMQ.

### Delivery

*   **Infrastructure:** Docker, GitLab CI, GitHub Actions, basic Kubernetes.
*   **Testing:** Jest, Playwright, integration tests against a seeded database.

***

## EDUCATION

### Hanoi University of Science and Technology

**BSc Information Technology** | 2011 - 2015

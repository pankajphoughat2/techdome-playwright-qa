# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security/data-exposure.spec.ts >> Sensitive data exposure @US-019 >> /careers: no secrets or unexpected emails in HTML or same-origin responses
- Location: tests/security/data-exposure.spec.ts:24:9

# Error details

```
Error: Non-Techdome email addresses exposed in source: you@company.com

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "you@company.com",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "Techdome Venture Studio — home" [ref=e6] [cursor=pointer]:
        - /url: /
        - generic [ref=e7]:
          - img "Techdome" [ref=e8]
          - generic [ref=e10]: Venture Studio
      - navigation "Primary" [ref=e11]:
        - button "Services" [ref=e13]
        - button "Portfolio" [ref=e18]
        - button "Insights" [ref=e23]
        - button "Company" [ref=e28]
        - link "Ventures" [ref=e32] [cursor=pointer]:
          - /url: /ventures
      - link "Contact Us" [ref=e34] [cursor=pointer]:
        - /url: /contact
  - main [ref=e39]:
    - generic [ref=e40]:
      - generic [ref=e41]:
        - generic [ref=e44]:
          - generic [ref=e45]:
            - generic [ref=e46]: Engineering foundry careers
            - heading "Build real venture software. Zero bureaucracy." [level=1] [ref=e49]:
              - generic [ref=e50]: Build
              - generic [ref=e51]: real
              - generic [ref=e52]: venture
              - generic [ref=e53]: software.
              - generic [ref=e54]: Zero
              - generic [ref=e55]: bureaucracy.
            - paragraph [ref=e57]: Join senior engineers and architects shipping software that runs in production. We co-found software ventures, build proprietary products, and embed autonomous pods to solve complex engineering challenges.
            - generic [ref=e59]:
              - link "View open roles" [ref=e60] [cursor=pointer]:
                - /url: "#roles"
              - link "Meet the leadership" [ref=e64] [cursor=pointer]:
                - /url: /about#leadership
          - figure "Discovery awaits — Techdome team gathering" [ref=e70]:
            - img "Techdome engineers together at a company gathering" [ref=e72]
        - generic [ref=e76]:
          - generic [ref=e77]:
            - generic [ref=e78]: 80+
            - generic [ref=e80]: Full-time engineers
          - generic [ref=e81]:
            - generic [ref=e82]: "3"
            - generic [ref=e84]: Global hubs
          - generic [ref=e85]:
            - generic [ref=e86]: "2020"
            - generic [ref=e88]: Shipping since
          - generic [ref=e89]:
            - generic [ref=e90]: "25"
            - generic [ref=e92]: Open positions
      - generic [ref=e94]:
        - generic [ref=e95]:
          - generic [ref=e96]: Why join us
          - heading "The culture we wanted to work in." [level=2] [ref=e98]:
            - generic [ref=e99]: The
            - generic [ref=e100]: culture
            - generic [ref=e101]: we
            - generic [ref=e102]: wanted
            - generic [ref=e103]: to
            - generic [ref=e104]: work
            - generic [ref=e105]: in.
          - paragraph [ref=e107]: Autonomy, real product ownership, senior peers, and zero corporate fluff between you and the work.
        - list [ref=e108]:
          - listitem [ref=e109]:
            - generic [ref=e110]:
              - generic [ref=e115]: Senior Talent
              - heading "Passion for Innovation" [level=3] [ref=e116]
              - paragraph [ref=e117]: Join an engineering collective dedicated to advancing modern software architecture. At Techdome, you'll work on high-conviction venture projects, collaborate with senior architects, and expand your technical depth while solving mission-critical engineering challenges.
          - listitem [ref=e118]:
            - generic [ref=e119]:
              - generic [ref=e126]: Autonomous Pods
              - heading "Collaborative & Inclusive Culture" [level=3] [ref=e127]
              - paragraph [ref=e128]: Experience a high-trust engineering environment where architectural ideas are debated on merit, not seniority. Our transparent culture promotes open communication, autonomous pods, and zero bureaucratic red tape.
          - listitem [ref=e129]:
            - generic [ref=e130]:
              - generic [ref=e136]: Production-First
              - heading "Make a Meaningful Impact" [level=3] [ref=e137]
              - paragraph [ref=e138]: Contribute to software systems that power real-world enterprises, clinical health networks, and open-source developer platforms. At Techdome, your code ships directly to production and impacts thousands of end-users worldwide.
      - generic [ref=e140]:
        - generic [ref=e141]:
          - generic [ref=e142]:
            - generic [ref=e143]: Culture & growth
            - heading "Where the work feels worth doing." [level=2] [ref=e145]:
              - generic [ref=e146]: Where
              - generic [ref=e147]: the
              - generic [ref=e148]: work
              - generic [ref=e149]: feels
              - generic [ref=e150]: worth
              - generic [ref=e151]: doing.
            - paragraph [ref=e153]: We fund and engineer our own proprietary products and venture platforms on the same modern stack we deploy for global partners. You work directly with technical founders, not layers of non-technical management.
            - list [ref=e154]:
              - listitem [ref=e155]:
                - generic [ref=e156]: Competitive compensation with performance incentives.
              - listitem [ref=e161]:
                - generic [ref=e162]: Autonomous 3-person pods (Architect, Full-Stack, QA).
              - listitem [ref=e167]:
                - generic [ref=e168]: Access to cloud credits, enterprise AI models & testing labs.
              - listitem [ref=e173]:
                - generic [ref=e174]: Collaborative workspaces in Hyderabad, Delaware & Dubai.
          - generic [ref=e179]:
            - figure "Pods at work — architecture reviewed before code ships." [ref=e181]:
              - img "Techdome engineers collaborating on production architecture" [ref=e183]
            - figure "Collaborative workspaces — designed for deep engineering focus." [ref=e187]:
              - img "The Techdome team together at the workspace" [ref=e189]
        - generic [ref=e193]:
          - link "Read articles Engineering Insights Check our engineering blog Explore our architecture breakdowns, AI pipeline patterns, and lessons learned shipping high-throughput production systems." [ref=e194] [cursor=pointer]:
            - /url: /insights
            - generic [ref=e195]: Read articles
            - generic [ref=e203]:
              - generic [ref=e204]: Engineering Insights
              - heading "Check our engineering blog" [level=3] [ref=e205]
              - paragraph [ref=e206]: Explore our architecture breakdowns, AI pipeline patterns, and lessons learned shipping high-throughput production systems.
          - link "Meet the team Founders & Leadership Meet the leadership team Meet Rahul Joshi, Gaurav Chouhan, and our core technical directors who mentor and build directly alongside our engineering pods." [ref=e207] [cursor=pointer]:
            - /url: /about#leadership
            - generic [ref=e208]: Meet the team
            - generic [ref=e219]:
              - generic [ref=e220]: Founders & Leadership
              - heading "Meet the leadership team" [level=3] [ref=e221]
              - paragraph [ref=e222]: Meet Rahul Joshi, Gaurav Chouhan, and our core technical directors who mentor and build directly alongside our engineering pods.
      - generic [ref=e224]:
        - generic [ref=e225]:
          - generic [ref=e226]: Current openings
          - heading "Open positions." [level=2] [ref=e228]:
            - generic [ref=e229]: Open
            - generic [ref=e230]: positions.
          - paragraph [ref=e232]: Engineers are reviewed on production code depth, architecture thinking, and problem-solving. Filter by team or search by role below.
        - generic [ref=e233]:
          - generic [ref=e234]:
            - textbox "Search roles, tech, or skills (e.g. Next.js, AWS, Python)..." [ref=e236]
            - generic [ref=e237]:
              - button "All 25" [ref=e238]:
                - generic [ref=e239]: All
                - generic [ref=e240]: "25"
              - button "Engineering 15" [ref=e241]:
                - generic [ref=e242]: Engineering
                - generic [ref=e243]: "15"
              - button "Design 2" [ref=e244]:
                - generic [ref=e245]: Design
                - generic [ref=e246]: "2"
              - button "Project Management 2" [ref=e247]:
                - generic [ref=e248]: Project Management
                - generic [ref=e249]: "2"
              - button "Human Resources 2" [ref=e250]:
                - generic [ref=e251]: Human Resources
                - generic [ref=e252]: "2"
              - button "Banking/ Loan Domain 1" [ref=e253]:
                - generic [ref=e254]: Banking/ Loan Domain
                - generic [ref=e255]: "1"
              - button "Quality Assurance 1" [ref=e256]:
                - generic [ref=e257]: Quality Assurance
                - generic [ref=e258]: "1"
              - button "Finance 2" [ref=e259]:
                - generic [ref=e260]: Finance
                - generic [ref=e261]: "2"
          - generic [ref=e263]:
            - text: Showing
            - strong [ref=e264]: "25"
            - text: positions
          - generic [ref=e265]:
            - generic [ref=e267]:
              - generic [ref=e268]:
                - generic [ref=e269]:
                  - generic [ref=e270]: Engineering
                  - generic [ref=e271]: ·
                  - generic [ref=e272]: Indore / Hyderabad
                  - generic [ref=e276]: ·
                  - generic [ref=e277]: 6+ yrs
                  - generic [ref=e281]: ·
                  - generic [ref=e282]: Full-time
                - heading "Principal Engineer (MERN)" [level=3] [ref=e283]
                - paragraph [ref=e284]: "Design it, build it, and own it in production. Anyone can draw a system diagram. What sets great architects apart is what happens after: whether the design holds when traffic grows tenfold, whether security survives a real audit,…"
              - link "Apply for role" [ref=e287] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/170161
            - generic [ref=e293]:
              - generic [ref=e294]:
                - generic [ref=e295]:
                  - generic [ref=e296]: Design
                  - generic [ref=e297]: ·
                  - generic [ref=e298]: Indore / Hyderabad
                  - generic [ref=e302]: ·
                  - generic [ref=e303]: 4 - 8 yrs
                  - generic [ref=e307]: ·
                  - generic [ref=e308]: Full-time
                - heading "UI/UX Designer" [level=3] [ref=e309]
                - paragraph [ref=e310]: Why this role matters AI is only useful if people understand it, trust it, and can act on it. As our UI/UX Designer, you’ll shape how analysts, reviewers, and executives work alongside AI, from conversational interfaces to…
              - link "Apply for role" [ref=e313] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/170144
            - generic [ref=e319]:
              - generic [ref=e320]:
                - generic [ref=e321]:
                  - generic [ref=e322]: Engineering
                  - generic [ref=e323]: ·
                  - generic [ref=e324]: Hyderabad / Indore
                  - generic [ref=e328]: ·
                  - generic [ref=e329]: 3 - 8 yrs
                  - generic [ref=e333]: ·
                  - generic [ref=e334]: Full-time
                - heading "Data Engineer" [level=3] [ref=e335]
                - paragraph [ref=e336]: "Why this role matters Every AI agent, scorecard, and dashboard we deliver is only as good as the data underneath it. As a Data Engineer, you’ll build that foundation: the pipelines, connectors, indexes, vector stores, and data…"
              - link "Apply for role" [ref=e339] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/170143
            - generic [ref=e345]:
              - generic [ref=e346]:
                - generic [ref=e347]:
                  - generic [ref=e348]: Project Management
                  - generic [ref=e349]: ·
                  - generic [ref=e350]: Hyderabad / Indore
                  - generic [ref=e354]: ·
                  - generic [ref=e355]: 4 - 8 yrs
                  - generic [ref=e359]: ·
                  - generic [ref=e360]: Full-time
                - heading "Business Analyst" [level=3] [ref=e361]
                - paragraph [ref=e362]: Why this role matters AI products only succeed when they solve the right problem in a way people can trust. As our Business Analyst, you’ll be the bridge between business intent and what gets built, turning ambiguous needs into…
              - link "Apply for role" [ref=e365] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/170112
            - generic [ref=e371]:
              - generic [ref=e372]:
                - generic [ref=e373]:
                  - generic [ref=e374]: Engineering
                  - generic [ref=e375]: ·
                  - generic [ref=e376]: Hyderabad / Indore
                  - generic [ref=e380]: ·
                  - generic [ref=e381]: 7+ years
                  - generic [ref=e385]: ·
                  - generic [ref=e386]: Full-time
                - heading "Senior Software Engineer" [level=3] [ref=e387]
                - paragraph [ref=e388]: About Techdome Techdome is a profitable, product-driven engineering organization with 80+ engineers building solutions across healthcare, fintech, AI, and SaaS.
              - link "Apply for role" [ref=e391] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/169402
            - generic [ref=e397]:
              - generic [ref=e398]:
                - generic [ref=e399]:
                  - generic [ref=e400]: Engineering
                  - generic [ref=e401]: ·
                  - generic [ref=e402]: Hyderabad / Indore / Mumbai / Remote
                  - generic [ref=e406]: ·
                  - generic [ref=e407]: 5+ yrs
                  - generic [ref=e411]: ·
                  - generic [ref=e412]: Full-time
                - heading "Sitecore Developer" [level=3] [ref=e413]
                - paragraph [ref=e414]: About Techdome Techdome Solutions Pvt. Ltd. is a technology consultancy and product engineering company founded in 2020 and headquartered in Indore.
              - link "Apply for role" [ref=e417] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/168389
            - generic [ref=e423]:
              - generic [ref=e424]:
                - generic [ref=e425]:
                  - generic [ref=e426]: Engineering
                  - generic [ref=e427]: ·
                  - generic [ref=e428]: Hyderabad / Indore
                  - generic [ref=e432]: ·
                  - generic [ref=e433]: 5+ yrs
                  - generic [ref=e437]: ·
                  - generic [ref=e438]: Full-time
                - heading "Salesforce Developer / Consultant" [level=3] [ref=e439]
                - paragraph [ref=e440]: About Techdome Techdome Solutions Pvt. Ltd. is a technology consultancy and product engineering company founded in 2020 and headquartered in Indore.
              - link "Apply for role" [ref=e443] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/168381
            - generic [ref=e449]:
              - generic [ref=e450]:
                - generic [ref=e451]:
                  - generic [ref=e452]: Engineering
                  - generic [ref=e453]: ·
                  - generic [ref=e454]: Hyderabad / Indore / Mumbai / Remote
                  - generic [ref=e458]: ·
                  - generic [ref=e459]: 5+ yrs
                  - generic [ref=e463]: ·
                  - generic [ref=e464]: Full-time
                - heading "DevOps / Infrastructure Engineer" [level=3] [ref=e465]
                - paragraph [ref=e466]: About Techdome Techdome Solutions Pvt. Ltd. is a technology consultancy and product engineering company founded in 2020 and headquartered in Indore.
              - link "Apply for role" [ref=e469] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/168376
            - generic [ref=e475]:
              - generic [ref=e476]:
                - generic [ref=e477]:
                  - generic [ref=e478]: Engineering
                  - generic [ref=e479]: ·
                  - generic [ref=e480]: Hyderabad / Indore / Remote / Mumbai
                  - generic [ref=e484]: ·
                  - generic [ref=e485]: 5+ yrs
                  - generic [ref=e489]: ·
                  - generic [ref=e490]: Full-time
                - heading "ServiceNow Architect" [level=3] [ref=e491]
                - paragraph [ref=e492]: About Techdome Techdome Solutions Pvt. Ltd. is a technology consultancy and product engineering company founded in 2020 and headquartered in Indore.
              - link "Apply for role" [ref=e495] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/168374
            - generic [ref=e501]:
              - generic [ref=e502]:
                - generic [ref=e503]:
                  - generic [ref=e504]: Engineering
                  - generic [ref=e505]: ·
                  - generic [ref=e506]: Hyderabad / Indore / Mumbai / Remote
                  - generic [ref=e510]: ·
                  - generic [ref=e511]: 5+ yrs
                  - generic [ref=e515]: ·
                  - generic [ref=e516]: Full-time
                - heading "Full Stack Developer" [level=3] [ref=e517]
                - paragraph [ref=e518]: About Techdome Techdome Solutions Pvt. Ltd. is a technology consultancy and product engineering company founded in 2020 and headquartered in Indore.
              - link "Apply for role" [ref=e521] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/168372
            - generic [ref=e527]:
              - generic [ref=e528]:
                - generic [ref=e529]:
                  - generic [ref=e530]: Engineering
                  - generic [ref=e531]: ·
                  - generic [ref=e532]: Hyderabad / Indore / Mumbai / Remote
                  - generic [ref=e536]: ·
                  - generic [ref=e537]: 5+ yrs
                  - generic [ref=e541]: ·
                  - generic [ref=e542]: Full-time
                - heading "AI/ML Engineer" [level=3] [ref=e543]
                - paragraph [ref=e544]: About Techdome Techdome Solutions Pvt. Ltd. is a technology consultancy and product engineering company founded in 2020 and headquartered in Indore.
              - link "Apply for role" [ref=e547] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/168363
            - generic [ref=e553]:
              - generic [ref=e554]:
                - generic [ref=e555]:
                  - generic [ref=e556]: Engineering
                  - generic [ref=e557]: ·
                  - generic [ref=e558]: Hyderabad / Indore / Mumbai / Remote
                  - generic [ref=e562]: ·
                  - generic [ref=e563]: 5+ yrs
                  - generic [ref=e567]: ·
                  - generic [ref=e568]: Full-time
                - heading "Python Developer" [level=3] [ref=e569]
                - paragraph [ref=e570]: About Techdome Techdome Solutions Pvt. Ltd. is a technology consultancy and product engineering company founded in 2020 and headquartered in Indore.
              - link "Apply for role" [ref=e573] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/168348
            - generic [ref=e579]:
              - generic [ref=e580]:
                - generic [ref=e581]:
                  - generic [ref=e582]: Engineering
                  - generic [ref=e583]: ·
                  - generic [ref=e584]: Hyderabad / Indore / Mumbai / Remote
                  - generic [ref=e588]: ·
                  - generic [ref=e589]: 5+ yrs
                  - generic [ref=e593]: ·
                  - generic [ref=e594]: Full-time
                - heading "Data Engineer" [level=3] [ref=e595]
                - paragraph [ref=e596]: About Techdome Techdome Solutions Pvt. Ltd. is a technology consultancy and product engineering company founded in 2020 and headquartered in Indore.
              - link "Apply for role" [ref=e599] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/168347
            - generic [ref=e605]:
              - generic [ref=e606]:
                - generic [ref=e607]:
                  - generic [ref=e608]: Engineering
                  - generic [ref=e609]: ·
                  - generic [ref=e610]: Hyderabad
                  - generic [ref=e614]: ·
                  - generic [ref=e615]: 5+ yrs
                  - generic [ref=e619]: ·
                  - generic [ref=e620]: Full-time
                - heading "Data Architect" [level=3] [ref=e621]
                - paragraph [ref=e622]: About Techdome Techdome Solutions Pvt. Ltd. is a technology consultancy and product engineering company founded in 2020 and headquartered in Indore.
              - link "Apply for role" [ref=e625] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/168345
            - generic [ref=e631]:
              - generic [ref=e632]:
                - generic [ref=e633]:
                  - generic [ref=e634]: Engineering
                  - generic [ref=e635]: ·
                  - generic [ref=e636]: Hyderabad / Indore
                  - generic [ref=e640]: ·
                  - generic [ref=e641]: 10+ yrs
                  - generic [ref=e645]: ·
                  - generic [ref=e646]: Full-time
                - heading "Data Architect" [level=3] [ref=e647]
                - paragraph [ref=e648]: "Position: Data Architect (Supply Chain) Employment Type: Contract + Remote Domain: Supply Chain / Logistics / Manufacturing Technology Stack: Microsoft Azure, Azure Data Services, Databricks Position Summary We are seeking an…"
              - link "Apply for role" [ref=e651] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/166854
            - generic [ref=e657]:
              - generic [ref=e658]:
                - generic [ref=e659]:
                  - generic [ref=e660]: Human Resources
                  - generic [ref=e661]: ·
                  - generic [ref=e662]: Hyderabad
                  - generic [ref=e666]: ·
                  - generic [ref=e667]: 0-1 yrs
                  - generic [ref=e671]: ·
                  - generic [ref=e672]: Internship
                - heading "HR Operations Intern" [level=3] [ref=e673]
                - paragraph [ref=e674]: About Techdome Techdome is a fast-growing Product Venture. We’re looking for a motivated fresher to join our People Operations team and learn how HR runs in a scaling tech company, with hands-on exposure from day one.
              - link "Apply for role" [ref=e677] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/166604
            - generic [ref=e683]:
              - generic [ref=e684]:
                - generic [ref=e685]:
                  - generic [ref=e686]: Banking/ Loan Domain
                  - generic [ref=e687]: ·
                  - generic [ref=e688]: Hyderabad / Indore
                  - generic [ref=e692]: ·
                  - generic [ref=e693]: 7+ yrs
                  - generic [ref=e697]: ·
                  - generic [ref=e698]: Full-time
                - heading "Quantitative Rates Researcher" [level=3] [ref=e699]
                - paragraph [ref=e700]: Job Summary We are seeking an experienced Quantitative Rates Researcher to support a leading investment bank’s algorithmic trading platform project.
              - link "Apply for role" [ref=e703] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/166432
            - generic [ref=e709]:
              - generic [ref=e710]:
                - generic [ref=e711]:
                  - generic [ref=e712]: Quality Assurance
                  - generic [ref=e713]: ·
                  - generic [ref=e714]: Remote / Hyderabad / Indore
                  - generic [ref=e718]: ·
                  - generic [ref=e719]: 5+ yrs
                  - generic [ref=e723]: ·
                  - generic [ref=e724]: Full-time
                - heading "QA Analyst" [level=3] [ref=e725]
                - paragraph [ref=e726]: Role Overview We are looking for an experienced QA Analyst / Test Analyst with hands-on SOFICO Miles experience to support quality assurance and testing activities for a client in the automotive leasing industry.
              - link "Apply for role" [ref=e729] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/166423
            - generic [ref=e735]:
              - generic [ref=e736]:
                - generic [ref=e737]:
                  - generic [ref=e738]: Engineering
                  - generic [ref=e739]: ·
                  - generic [ref=e740]: Noida
                  - generic [ref=e744]: ·
                  - generic [ref=e745]: 15+ yrs
                  - generic [ref=e749]: ·
                  - generic [ref=e750]: Full-time
                - heading "Solution Architect" [level=3] [ref=e751]
                - paragraph [ref=e752]: Role Overview We are looking for a hands-on Software Architect to own the end-to-end architecture of a multi-tenant AI platform, including the integration bus, semantic layer, agent runtime, workflow engine, and data stores.
              - link "Apply for role" [ref=e755] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/166393
            - generic [ref=e761]:
              - generic [ref=e762]:
                - generic [ref=e763]:
                  - generic [ref=e764]: Finance
                  - generic [ref=e765]: ·
                  - generic [ref=e766]: Hyderabad / Indore
                  - generic [ref=e770]: ·
                  - generic [ref=e771]: 0-2 yrs
                  - generic [ref=e775]: ·
                  - generic [ref=e776]: Full-time
                - heading "Chartered Accountant – Finance & Compliance" [level=3] [ref=e777]
                - paragraph [ref=e778]: About Techdome Techdome is a product-driven technology company building AI-first solutions across Healthcare, FinTech, HRTech, Payments, and Enterprise SaaS.
              - link "Apply for role" [ref=e781] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/164874
            - generic [ref=e787]:
              - generic [ref=e788]:
                - generic [ref=e789]:
                  - generic [ref=e790]: Engineering
                  - generic [ref=e791]: ·
                  - generic [ref=e792]: Hyderabad / Indore
                  - generic [ref=e796]: ·
                  - generic [ref=e797]: 6+ Months
                  - generic [ref=e801]: ·
                  - generic [ref=e802]: Internship
                - heading "Quality Assurance Engineer Intern" [level=3] [ref=e803]
                - paragraph [ref=e804]: About Techdome Techdome (founded 2020) builds products from scratch for clients, scales existing ones, and builds its own — Sparrow (API testing), Catalyst AI (ERP), Saral Funding (fintech), and JustInterview.ai (AI hiring).
              - link "Apply for role" [ref=e807] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/164306
            - generic [ref=e813]:
              - generic [ref=e814]:
                - generic [ref=e815]:
                  - generic [ref=e816]: Project Management
                  - generic [ref=e817]: ·
                  - generic [ref=e818]: Hyderabad / Indore
                  - generic [ref=e822]: ·
                  - generic [ref=e823]: 4-6 yrs
                  - generic [ref=e827]: ·
                  - generic [ref=e828]: Full-time
                - heading "Business Analyst" [level=3] [ref=e829]
                - paragraph [ref=e830]: "Role summary: The Business Analyst turns business intent into clear, testable requirements for AI and data products, and keeps the backlog, stakeholders, and validation aligned from discovery through UAT."
              - link "Apply for role" [ref=e833] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/164191
            - generic [ref=e839]:
              - generic [ref=e840]:
                - generic [ref=e841]:
                  - generic [ref=e842]: Human Resources
                  - generic [ref=e843]: ·
                  - generic [ref=e844]: Hyderabad
                  - generic [ref=e848]: ·
                  - generic [ref=e849]: 2-4 yrs
                  - generic [ref=e853]: ·
                  - generic [ref=e854]: Full-time
                - heading "HR Operations Executive" [level=3] [ref=e855]
                - paragraph [ref=e856]: At Techdome, a fast-growing Product Venture, you'll own the people operations that keep our scaling tech team running smoothly — onboarding, HR systems, compliance, and the full employee lifecycle.
              - link "Apply for role" [ref=e859] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/163379
            - generic [ref=e865]:
              - generic [ref=e866]:
                - generic [ref=e867]:
                  - generic [ref=e868]: Design
                  - generic [ref=e869]: ·
                  - generic [ref=e870]: Hyderabad / Indore
                  - generic [ref=e874]: ·
                  - generic [ref=e875]: 1+ yrs
                  - generic [ref=e879]: ·
                  - generic [ref=e880]: Full-time
                - heading "Graphic Designer" [level=3] [ref=e881]
                - paragraph [ref=e882]: About Techdome Techdome is a product-driven technology company building AI-first solutions across Healthcare, FinTech, HRTech, Payments, and Enterprise SaaS.
              - link "Apply for role" [ref=e885] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/162242
            - generic [ref=e891]:
              - generic [ref=e892]:
                - generic [ref=e893]:
                  - generic [ref=e894]: Finance
                  - generic [ref=e895]: ·
                  - generic [ref=e896]: Dewas
                  - generic [ref=e900]: ·
                  - generic [ref=e901]: 1-2 yrs
                  - generic [ref=e905]: ·
                  - generic [ref=e906]: Full-time
                - heading "Accountant – GST & Inventory" [level=3] [ref=e907]
                - paragraph [ref=e908]: "Location: Near Dewas, Madhya Pradesh (Hybrid flexibility available) Experience: 1–2 Years Compensation: ₹20,000 – ₹25,000 / month Employment Type: Full-Time About the Role We are looking for a responsible, detail-oriented…"
              - link "Apply for role" [ref=e911] [cursor=pointer]:
                - /url: https://techdome.keka.com/careers/jobdetails/162226
  - contentinfo [ref=e916]:
    - generic [ref=e917]:
      - generic [ref=e919]:
        - generic [ref=e920]:
          - heading "Subscribe to our newsletter" [level=2] [ref=e925]
          - paragraph [ref=e926]: Bi-weekly architectural breakdowns, system design notes and engineering insights.
        - generic [ref=e929]:
          - generic [ref=e930]:
            - textbox "Enter your work email" [ref=e932]
            - button "Subscribe" [ref=e933] [cursor=pointer]
          - generic [ref=e936]:
            - text: Every other Monday. Unsubscribe anytime.
            - link "Privacy policy" [ref=e937] [cursor=pointer]:
              - /url: /privacy
      - generic [ref=e938]:
        - generic [ref=e939]:
          - link "Techdome Product venture studio" [ref=e940] [cursor=pointer]:
            - /url: /
            - img "Techdome" [ref=e941]
            - generic [ref=e942]: Product venture studio
          - paragraph [ref=e943]: "We build software ventures two ways: our own products, and yours. Senior engineering pods, a proven blueprint, and production AI automation."
          - link "Book a 30-minute call" [ref=e944] [cursor=pointer]:
            - /url: /contact
          - generic [ref=e948]:
            - link "WhatsApp" [ref=e949] [cursor=pointer]:
              - /url: /go/whatsapp
            - link "+91 9652049922" [ref=e953] [cursor=pointer]:
              - /url: tel:+919652049922
          - link "Techdome, 3rd floor, 91springboard, Laxmi Cyber City, Whitefields, Kondapur, HITEC City, Hyderabad, Telangana 500084" [ref=e958] [cursor=pointer]:
            - /url: https://www.google.com/maps/search/?api=1&query=17.45731%2C78.36569
          - generic [ref=e963]:
            - link "Upwork $300K+ · 100% Upwork" [ref=e964] [cursor=pointer]:
              - /url: https://www.upwork.com/agencies/techdome
              - img "Upwork" [ref=e965]
              - generic [ref=e967]: $300K+ · 100% Upwork
            - link [ref=e968] [cursor=pointer]:
              - /url: https://clutch.co/profile/techdome
              - img "Clutch verified agency profile" [ref=e969]
              - generic [aria-hidden] [ref=e970]: Clutch
            - link "Techdome on LinkedIn" [ref=e971] [cursor=pointer]:
              - /url: https://www.linkedin.com/company/techdome-solutions
              - img "LinkedIn" [ref=e972]
            - link "Techdome on X" [ref=e974] [cursor=pointer]:
              - /url: https://x.com/techdomesolves
              - img "X (Twitter)" [ref=e975]
            - link "Techdome on Instagram" [ref=e977] [cursor=pointer]:
              - /url: https://www.instagram.com/techdome.io/
              - img "Instagram" [ref=e978]
            - link "Techdome on GitHub" [ref=e981] [cursor=pointer]:
              - /url: https://github.com/techdome-io
              - img "GitHub" [ref=e982]
            - link "Techdome on Facebook" [ref=e984] [cursor=pointer]:
              - /url: https://www.facebook.com/techdomesolutions
              - img "Facebook" [ref=e985]
            - link "Techdome on YouTube" [ref=e987] [cursor=pointer]:
              - /url: https://www.youtube.com/@automationsbyrahul
              - img "YouTube" [ref=e988]
        - generic [ref=e990]:
          - navigation "Services" [ref=e991]:
            - heading [level=2] [ref=e992]:
              - link "Services" [ref=e993] [cursor=pointer]:
                - /url: /services
            - list [ref=e997]:
              - listitem [ref=e998]:
                - link "Venture Studio" [ref=e999] [cursor=pointer]:
                  - /url: /studio
              - listitem [ref=e1001]:
                - link "Techdome Ventures (fund)" [ref=e1002] [cursor=pointer]:
                  - /url: /ventures
              - listitem [ref=e1004]:
                - link "MVP development" [ref=e1005] [cursor=pointer]:
                  - /url: /studio#mvp
              - listitem [ref=e1007]:
                - link "Staff Augmentation" [ref=e1008] [cursor=pointer]:
                  - /url: /staff-augmentation
              - listitem [ref=e1010]:
                - link "Hire React developers" [ref=e1011] [cursor=pointer]:
                  - /url: /staff-augmentation#role-react-nextjs
              - listitem [ref=e1013]:
                - link "Hire Node.js developers" [ref=e1014] [cursor=pointer]:
                  - /url: /staff-augmentation#role-nodejs-backend
              - listitem [ref=e1016]:
                - link "n8n & AI Automation Moat" [ref=e1017] [cursor=pointer]:
                  - /url: /automation
                  - generic [ref=e1018]: n8n & AI Automation
                  - generic [ref=e1019]: Moat
              - listitem [ref=e1020]:
                - link "GCC Services" [ref=e1021] [cursor=pointer]:
                  - /url: /gcc
              - listitem [ref=e1023]:
                - link "Pricing" [ref=e1024] [cursor=pointer]:
                  - /url: /pricing
              - listitem [ref=e1026]:
                - link "AI voice agents" [ref=e1027] [cursor=pointer]:
                  - /url: /automation#ai-voice-agents
          - navigation "Industries" [ref=e1029]:
            - heading [level=2] [ref=e1030]:
              - link "Industries" [ref=e1031] [cursor=pointer]:
                - /url: /work
            - list [ref=e1035]:
              - listitem [ref=e1036]:
                - link "Healthcare" [ref=e1037] [cursor=pointer]:
                  - /url: /industries/healthcare-software-development
              - listitem [ref=e1039]:
                - link "Enterprise & ERP" [ref=e1040] [cursor=pointer]:
                  - /url: /work?domain=Enterprise%20%26%20ERP#case-studies
              - listitem [ref=e1042]:
                - link "AI & Automation" [ref=e1043] [cursor=pointer]:
                  - /url: /work?domain=AI%20%26%20Automation#case-studies
              - listitem [ref=e1045]:
                - link "FinTech" [ref=e1046] [cursor=pointer]:
                  - /url: /work?domain=FinTech#case-studies
              - listitem [ref=e1048]:
                - link "Consumer & Marketplace" [ref=e1049] [cursor=pointer]:
                  - /url: /work?domain=Consumer%20%26%20Marketplace#case-studies
              - listitem [ref=e1051]:
                - link "Public Sector" [ref=e1052] [cursor=pointer]:
                  - /url: /work?domain=Public%20Sector#case-studies
              - listitem [ref=e1054]:
                - link "Education" [ref=e1055] [cursor=pointer]:
                  - /url: /work?domain=EdTech%20%26%20Education#case-studies
              - listitem [ref=e1057]:
                - link "Telehealth" [ref=e1058] [cursor=pointer]:
                  - /url: /industries/telehealth-software-development
          - navigation "Products" [ref=e1060]:
            - heading [level=2] [ref=e1061]:
              - link "Products" [ref=e1062] [cursor=pointer]:
                - /url: /products
            - list [ref=e1066]:
              - listitem [ref=e1067]:
                - 'link "Sparrow PH #4 ×2" [ref=e1068] [cursor=pointer]':
                  - /url: /products/sparrow
                  - generic [ref=e1069]: Sparrow
                  - generic [ref=e1070]: "PH #4 ×2"
              - listitem [ref=e1071]:
                - link "JustInterview.ai" [ref=e1072] [cursor=pointer]:
                  - /url: /products/justinterview-ai
              - listitem [ref=e1074]:
                - link "Saral Funding" [ref=e1075] [cursor=pointer]:
                  - /url: /products/saral-funding
              - listitem [ref=e1077]:
                - link "Geolytics" [ref=e1078] [cursor=pointer]:
                  - /url: /products/geolytics
              - listitem [ref=e1080]:
                - link "Aether Voice" [ref=e1081] [cursor=pointer]:
                  - /url: /products/aether-voice
              - listitem [ref=e1083]:
                - link "Catalyst" [ref=e1084] [cursor=pointer]:
                  - /url: /products/catalyst
              - listitem [ref=e1086]:
                - link "ARC Studio OS" [ref=e1087] [cursor=pointer]:
                  - /url: /products/arc
          - navigation "Company" [ref=e1089]:
            - heading "Company" [level=2] [ref=e1090]
            - list [ref=e1091]:
              - listitem [ref=e1092]:
                - link "About & entities" [ref=e1093] [cursor=pointer]:
                  - /url: /about
              - listitem [ref=e1095]:
                - link "Portfolio" [ref=e1096] [cursor=pointer]:
                  - /url: /work
              - listitem [ref=e1098]:
                - link "Engineering insights" [ref=e1099] [cursor=pointer]:
                  - /url: /insights
              - listitem [ref=e1101]:
                - link "Topics" [ref=e1102] [cursor=pointer]:
                  - /url: /topics
              - listitem [ref=e1104]:
                - link "Glossary" [ref=e1105] [cursor=pointer]:
                  - /url: /glossary
              - listitem [ref=e1107]:
                - link "Free tools" [ref=e1108] [cursor=pointer]:
                  - /url: /tools
              - listitem [ref=e1110]:
                - link "n8n templates" [ref=e1111] [cursor=pointer]:
                  - /url: /automation/templates
              - listitem [ref=e1113]:
                - link "Newsletter" [ref=e1114] [cursor=pointer]:
                  - /url: /newsletter
              - listitem [ref=e1116]:
                - link "Life at Techdome" [ref=e1117] [cursor=pointer]:
                  - /url: /life-at-techdome
              - listitem [ref=e1119]:
                - link "Careers Hiring" [ref=e1120] [cursor=pointer]:
                  - /url: /careers
                  - generic [ref=e1121]: Careers
                  - generic [ref=e1122]: Hiring
              - listitem [ref=e1123]:
                - link "FAQ" [ref=e1124] [cursor=pointer]:
                  - /url: /faq
      - generic [ref=e1126]:
        - generic [ref=e1127]:
          - link "Privacy" [ref=e1128] [cursor=pointer]:
            - /url: /privacy
          - link "Terms" [ref=e1129] [cursor=pointer]:
            - /url: /terms
          - link "Security" [ref=e1130] [cursor=pointer]:
            - /url: /security
          - link "Client reviews" [ref=e1131] [cursor=pointer]:
            - /url: /reviews
          - link "Cookie policy" [ref=e1132] [cursor=pointer]:
            - /url: /cookie-policy
          - button "Cookie settings" [ref=e1133]
          - button "Do not sell or share my personal information" [ref=e1134]
          - link "Sitemap" [ref=e1135] [cursor=pointer]:
            - /url: /sitemap.xml
        - generic [ref=e1136]:
          - generic "ISO Accredited" [ref=e1137]:
            - img "ISO Accredited" [ref=e1138]
            - generic [ref=e1144]: ISO
          - generic "DPIIT Recognized" [ref=e1145]:
            - img "DPIIT Recognized" [ref=e1146]:
              - generic [ref=e1151]: DPIIT
              - generic [ref=e1152]: GOVT. OF INDIA
            - generic [ref=e1153]: DPIIT
          - link "TechBehemoths Verification":
            - /url: https://techbehemoths.com/company/techdome
            - img "TechBehemoths Verification"
        - generic [ref=e1154]: © Copyright 2026, All Rights Reserved by Techdome
  - alert [ref=e1155]
  - button "Open Pod chat" [ref=e1156]
  - dialog "Cookie preferences" [ref=e1164]:
    - paragraph [ref=e1165]:
      - text: We use cookies to measure how the site is used and which ads bring visitors here. Nothing runs until you choose, and the site works either way.
      - link "Cookie policy" [ref=e1166] [cursor=pointer]:
        - /url: /cookie-policy
    - generic [ref=e1167]:
      - button "Reject all" [ref=e1168]
      - button "Accept all" [ref=e1169]
    - button "Preferences" [ref=e1170]
```

# Test source

```ts
  1  | import { test, expect } from '../../utils/fixtures';
  2  | 
  3  | /** High-signal secret formats. Deliberately specific — a generic "long random string" rule drowns in Next.js build hashes. */
  4  | const SECRET_PATTERNS: [string, RegExp][] = [
  5  |   ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  6  |   ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  7  |   ['OpenAI / Anthropic key', /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{32,}\b/],
  8  |   ['Stripe live key', /\b(?:sk|rk)_live_[0-9a-zA-Z]{20,}\b/],
  9  |   ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{36}\b/],
  10 |   ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/],
  11 |   ['Private key block', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  12 |   ['JWT', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
  13 |   ['DB connection string', /\b(?:postgres(?:ql)?|mongodb(?:\+srv)?|mysql|redis):\/\/[^\s"'<>]+:[^\s"'<>]+@/],
  14 | ];
  15 | 
  16 | /** Addresses Techdome publishes on purpose. Anything else in page source is flagged for review. */
  17 | const PUBLIC_EMAIL_DOMAINS = ['techdome.net.in', 'techdome.io', 'example.com'];
  18 | const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
  19 | // Asset filenames like "logo@2x.png" look like emails.
  20 | const NOT_AN_EMAIL = /\.(png|jpe?g|webp|svg|gif|avif|js|css)$/i;
  21 | 
  22 | test.describe('Sensitive data exposure @US-019', () => {
  23 |   for (const path of ['/', '/contact', '/careers', '/newsletter']) {
  24 |     test(`${path}: no secrets or unexpected emails in HTML or same-origin responses`, async ({ page, baseURL }) => {
  25 |       const origin = new URL(baseURL!).origin;
  26 |       const bodies: { url: string; text: string }[] = [];
  27 |       page.on('response', async (res) => {
  28 |         const url = res.url();
  29 |         const type = res.headers()['content-type'] ?? '';
  30 |         if (!url.startsWith(origin) || !/(html|javascript|json|text\/x-component)/.test(type)) return;
  31 |         try { bodies.push({ url, text: await res.text() }); } catch { /* body evicted after navigation */ }
  32 |       });
  33 | 
  34 |       await page.goto(path, { waitUntil: 'load' });
  35 |       await page.mouse.wheel(0, 5000);
  36 |       await page.waitForTimeout(1500);
  37 |       bodies.push({ url: `${path} (rendered DOM)`, text: await page.content() });
  38 |       expect(bodies.length).toBeGreaterThan(1);
  39 | 
  40 |       const secrets: string[] = [];
  41 |       const emails = new Set<string>();
  42 |       for (const { url, text } of bodies) {
  43 |         for (const [label, re] of SECRET_PATTERNS) {
  44 |           const m = re.exec(text);
  45 |           if (m) secrets.push(`${label} in ${url}: ${m[0].slice(0, 12)}…`);
  46 |         }
  47 |         for (const e of text.match(EMAIL) ?? []) {
  48 |           if (NOT_AN_EMAIL.test(e)) continue;
  49 |           const domain = e.split('@')[1].toLowerCase();
  50 |           if (!PUBLIC_EMAIL_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))) emails.add(e);
  51 |         }
  52 |       }
  53 |       await test.info().attach('scanned-urls.txt', { body: bodies.map((b) => b.url).join('\n') });
  54 | 
  55 |       expect(secrets, secrets.join('\n')).toEqual([]);
> 56 |       expect([...emails], `Non-Techdome email addresses exposed in source: ${[...emails].join(', ')}`).toEqual([]);
     |                                                                                                        ^ Error: Non-Techdome email addresses exposed in source: you@company.com
  57 |     });
  58 |   }
  59 | 
  60 |   test('all sub-resources are served over HTTPS (no mixed content)', async ({ page }) => {
  61 |     const insecure: string[] = [];
  62 |     page.on('request', (req) => { if (req.url().startsWith('http://')) insecure.push(req.url()); });
  63 |     await page.goto('/', { waitUntil: 'load' });
  64 |     expect(insecure).toEqual([]);
  65 |   });
  66 | 
  67 |   test('cookies set on first visit are Secure', async ({ page, context }) => {
  68 |     await page.goto('/', { waitUntil: 'load' });
  69 |     const cookies = await context.cookies();
  70 |     const weak = cookies.filter((c) => c.domain.includes('techdome.io') && !c.secure);
  71 |     expect(weak.map((c) => c.name)).toEqual([]);
  72 |   });
  73 | });
  74 | 
```
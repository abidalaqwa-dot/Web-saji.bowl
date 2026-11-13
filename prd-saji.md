================================================================================
PRODUCT REQUIREMENTS DOCUMENT (PRD) & MASTER PROMPT FOR GOOGLE ANTIGRAVITY
PROJECT NAME: SAJI — Official Brand & Product Showcase Website
TAGLINE: "SAJIan Healthy Bowl For Your Daily Needs!"
DESIGN REFERENCE: 1:1 Adaptation of "Roast & Ritual" Retro-Organic Neo-Brutalist UI
================================================================================

ROLE & OBJECTIVE FOR GOOGLE ANTIGRAVITY:
Act as an Elite Creative Frontend Engineer and UI/UX Designer. Build a complete, fully responsive, interactive, high-converting single-page web application for "SAJI" (Sajian Healthy Bowl). 

CRITICAL DESIGN DIRECTIVE:
You MUST replicate the exact layout structure, visual hierarchy, card geometry, typography proportions, neo-brutalist pill buttons, checkerboard pixel accents, tilted marquee ribbons, and interactive micro-experiences from the reference design ("Roast & Ritual"), while 100% replacing the branding, color palette, copywriting, and product catalog with SAJI's brand assets and Indonesian local superfood identity.

--------------------------------------------------------------------------------
1. BRAND IDENTITY & CORE MESSAGING
--------------------------------------------------------------------------------
- Brand Name: SAJi (Stylized with a bowl illustration inside the letter "A" and a top-down colorful healthy bowl illustration as the dot of the letter "i").
- Sub-brand / Descriptor: Sajian Healthy Bowl
- Main Tagline: "SAJIan Healthy Bowl For Your Daily Needs!"
- Secondary Slogans:
  1. "Flavorful, fresh, and healthy eats made with Nusantara soul."
  2. "DESERVE A TREAT. NOURISH YOUR BODY."
  3. "- SAJi It Your Way -"
- Official Social Media: @saji.bowl (Instagram)
- Core Value Proposition: Healthy bowls and wraps powered by indigenous Indonesian (Nusantara) complex carbohydrates—Sorghum from Sumba, Purple Sweet Potato (Ubi Ungu) from Yogya, and Cassava (Singkong) from Bogor—paired with lean proteins, rainbow vegetables, and signature local dressings with transparent macro-nutrition calculations.

--------------------------------------------------------------------------------
2. COLOR PALETTE MAPPING (REFERENCE -> SAJI ADAPTATION)
--------------------------------------------------------------------------------
Map the reference coffee aesthetic strictly to SAJI's official color palette:
1. Primary Dark (Replaces Reference Espresso Brown):
   - Deep Forest Green: `#1E3622` (Used for dark section backgrounds, primary headlines on light backgrounds, button outlines, and hard offset shadows).
   - Dark Pine Shadow: `#142617` (Used for organic wavy background overlays inside dark sections and button drop-shadows).
2. Primary Light (Replaces Reference Cream Background):
   - Warm Cream / Off-White: `#F7F5F0` (Main light background for Hero, About Us, and Customer Experience sections, plus text color on dark backgrounds).
   - Soft Oatmeal Wave: `#EBE6DA` (Secondary subtle wavy background shape inside the Hero section).
   - Pure Crisp White: `#FFFFFF` (Used for the floating top navigation bar and inner cards).
3. Brand Primary Accent (Replaces Reference Pastel Pink):
   - SAJI Terracotta / Burnt Orange: `#C85A32` (Used for the SAJi logo, slanted marquee banner tape, featured price/calorie badges, starburst icons, and active image frame borders).
4. Secondary Warm Accent (Replaces Reference Butter Yellow):
   - SAJI Warm Ochre / Golden Root: `#E8A855` & Soft Golden Amber `#F3C677` (Used for primary CTA pill buttons, the expanded center product card in the catalog, checkerboard pixel motifs, and footer highlight cards).
5. Tertiary Fresh Accent (Replaces Reference Pastel Lavender):
   - Nusantara Sage Green: `#A3C193` (Used for secondary floating badges, step number badge `01`, giant quote mark icon, and the vertical "SAY HELLO" contact pill).
   - Yogya Ubi Purple (Optional Micro-Accent): `#7A497A` (Subtle tag highlight for Yogya Purple Sweet Potato items).

--------------------------------------------------------------------------------
3. TYPOGRAPHY & SIGNATURE UI COMPONENTS
--------------------------------------------------------------------------------
- Display Headlines (Hero, Section Titles, Marquee, Review Quote):
  - Font Family: `'Bebas Neue'`, `'Anton'`, or `'Oswald'` (700/800 weight), ALL CAPS, tight letter-spacing (`-0.02em`), tight line-height (`0.95` to `1.05`).
- Brand Logo & Curved Product Titles:
  - Font Family: `'Fraunces'` or `'Recoleta'` / bold organic retro serif.
- Body Copy, Nutritional Macros & UI Controls:
  - Font Family: `'Plus Jakarta Sans'` or `'Inter'` (400, 500, 600, 700 weights).
- Signature UI Motif 1: Neo-Brutalist Pill Buttons:
  - Pill shape (`border-radius: 9999px`), `1.5px solid #1E3622`, solid offset shadow (`box-shadow: 3px 4px 0px #1E3622`), uppercase bold text, accompanied by a minimalist line icon on the right (e.g., salad bowl icon or arrow). Hover state translates button `(-1px, -1px)` and increases shadow to `5px 6px 0px #1E3622`.
- Signature UI Motif 2: 2x4 Checkerboard Pixel Grid:
  - A decorative geometric grid made of 8 squares (2 rows x 4 columns) alternating filled squares and empty spaces (like a retro racing flag). Used in the top-right of the Hero, Katalog Product, and About Us sections.
- Signature UI Motif 3: Starburst Separator Marquee (`✺`):
  - Full-width horizontal/tilted ribbons featuring bold uppercase keywords separated by 8-point or 10-point geometric starburst icons (`✺`).

--------------------------------------------------------------------------------
4. DETAILED SECTION-BY-SECTION ARCHITECTURE & CONTENT
--------------------------------------------------------------------------------

================================================================================
NAVIGATION BAR (FLOATING PILL HEADER INSIDE HERO)
================================================================================
- Layout: Full-width container with top padding, housing a white (`#FFFFFF`) rounded pill navbar (`border-radius: 16px`, `padding: 16px 32px`, subtle shadow).
- Left Menu Links (Uppercase, `13px`, letter-spacing `0.08em`, `#1E3622`):
  - `ABOUT US` (scrolls to `#about`)
  - `CATALOG` (scrolls to `#catalog`)
  - `EXPERIENCE` (scrolls to `#experience`)
- Center Brand Logo:
  - `SAJi` logo in Terracotta (`#C85A32`) with bowl detail inside 'A' and healthy bowl dot on 'i', plus subtitle `Sajian Healthy Bowl` in Forest Green (`#1E3622`).
- Right Menu Links & Actions:
  - `REVIEWS` (scrolls to `#reviews`)
  - `CONTACT` (scrolls to `#contact`)
  - `ORDER NOW ▾` (dropdown menu with quick links to GrabFood, GoFood, ShopeeFood, and WhatsApp)
  - Cart / Order Bag Icon Button on far right with dynamic item counter badge.

================================================================================
SECTION 1: HERO SECTION (1:1 Reference: Image 1 - "GOOD COFFEE. BETTER MOMENTS")
================================================================================
- Background: Warm Cream (`#F7F5F0`) with a large, soft organic diagonal wavy shape in `#EBE6DA` flowing across the middle-to-bottom area.
- Top-Left Giant Display Headline (Deep Forest Green `#1E3622`, massive condensed uppercase):
  Line 1: `SAJIAN HEALTHY BOWL.`
  Line 2: `FOR YOUR DAILY NEEDS!`
- Top-Right Accent:
  - 2x4 Checkerboard pixel grid in Warm Ochre (`#F3C677`).
- Centerpiece Visual (Overlapping Dual Hero Products):
  - Directly overlapping the bottom of the giant headline in the center of the viewport:
  - Front-Left Product (tilted `-6deg`, larger scale): High-resolution cutout of **SAJI BOWL (Sajian Sumba / Sajian Yogya)** showing vibrant toppings (purple sweet potato, golden tempeh, grilled chicken, sweet corn, fresh greens, sorghum grains) with a curved badge on the bowl reading `SAJIAN HEALTHY BOWL • @SAJI.BOWL`.
  - Back-Right Product (tilted `+8deg`, slightly behind): High-resolution cutout of **SAJI WRAP (Sajian Gulung Yogya)** wrapped in kraft paper showing the purple sweet potato tortilla and colorful chicken & veggie fillings.
  - Floating Raw Ingredients at the Base (replacing the caramel cubes and chocolate chunks in the reference): Scattered fresh purple sweet potato cubes, sliced cassava roots, sorghum grains, and fresh green leaves with realistic contact shadows on the cream floor.
- Middle-Left Subheadline & CTA Cluster:
  - Paragraph (`max-width: 320px`, `#1E3622`, `15px`):
    "Flavorful, fresh, and healthy eats made with Nusantara soul. Crafted from local roots and ancient grains to nourish your body every single day."
  - Primary CTA Button (Warm Ochre `#F3C677` pill button with `#1E3622` border and hard offset shadow):
    `ORDER SAJI` + small bowl icon.
  - Secondary CTA Link (next to button, bold uppercase `#1E3622` with bottom underline and arrow):
    `EXPLORE MENU →`
- Middle-Right 3-Column Metrics Counter (Bold condensed numbers in `#1E3622` with small labels below):
  - Stat 1: `4+` / `Signature Menus`
  - Stat 2: `±360` / `Smart Kkal`
  - Stat 3: `100%` / `Nusantara Carbs`
- Bottom Slanted Marquee Tape:
  - Full-width ribbon tilted at `-2.5deg` cutting across the bottom of the Hero section.
  - Background: SAJI Terracotta (`#C85A32`), Text & 10-point Starbursts (`✺`) in Deep Forest Green (`#1E3622`) or Cream (`#F7F5F0`):
  - Scrolling Text: `ANCIENT GRAIN ✺ GLUTEN FREE ✺ LOCAL ROOTS ✺ SWEET POTATO BASE ✺ NUSANTARA SOUL ✺ SAJI IT YOUR WAY ✺`

================================================================================
SECTION 2: ABOUT US — OUR STORY, THE CRAFT & NUSANTARA SOUL
(Combines Reference Image 3 "THE CRAFT" & Image 4 "THE CAFE EXPERIENCE")
================================================================================
This section tells the complete story of SAJI in two seamless parts on a Warm Cream (`#F7F5F0`) background:

PART 2A: THE CRAFT & INGREDIENTS (1:1 Reference: Image 3 - "SIMPLE INGREDIENTS. CAREFUL HANDS.")
- Top-Left Eyebrow: `ABOUT US • THE SAJI CRAFT` (Monospace/uppercase tracking).
- Top-Left Giant Headline (`#1E3622`):
  Line 1: `LOCAL INGREDIENTS.`
  Line 2: `NUSANTARA SOUL.`
- Top-Right Header Cluster:
  - 2x4 Checkerboard pixel grid in Warm Ochre (`#F3C677`) on the left, paired with a descriptive paragraph on the right (`max-width: 360px`):
    "From indigenous Indonesian roots to the final drizzle of signature dressing, every bowl is intentional—complex local carbs, balanced macros, and honest nutrition in every bite."
- Interactive 4-Step Feature Container:
  - A large rounded rectangle container (`border-radius: 24px`, `overflow: hidden`, `border: 1.5px solid #1E3622`).
  - Top Main Display Area (Deep Forest Green `#1E3622` background, `padding: 48px`):
    - Left Column (Text Content of Active Step):
      - Eyebrow in Cream: `SELECT` (dynamically updates per step).
      - Headline in Warm Ochre (`#F3C677`, bold condensed uppercase):
        `ROOTS & GRAINS WORTH CHOOSING`
      - Body Copy in Cream (`#F7F5F0`):
        "We believe healthy eating doesn't need to rely on imported ingredients. SAJI champions Indonesia's own superfoods—Sorghum from Sumba, Purple Sweet Potato from Yogya, and Cassava from Bogor—packed with natural fiber, antioxidants, and sustained energy."
    - Right Column (Visual Frame of Active Step):
      - Rounded rectangle image showing SAJI's raw local ingredients / bowls with a thick offset L-shaped border frame on the bottom-right in SAJI Terracotta (`#C85A32`).
      - Floating Square/Rounded Badge on the top-left corner of the image in Nusantara Sage Green (`#A3C193`) with bold `#1E3622` text: `01` (updates to `01`, `02`, `03`, `04` when tabs below are clicked).
  - Bottom 3-Column Interactive Step Selector Bar (Warm Cream `#F7F5F0` background divided by `1px solid #1E3622` vertical borders):
    - Clicking any step swaps the active content in the main green display above (include all 4 steps in state so user can cycle through 01 to 04):
      - Step 01: Eyebrow `SELECT` | Title `ROOTS & GRAINS WORTH CHOOSING` | Badge `01`
      - Step 02: Eyebrow `NOURISH` | Title `MEASURED MACROS & HIGH PROTEIN` | Badge `02` (Copy highlights `±24g to ±31g protein` from grilled chicken, tempeh, and mushrooms with `±360–425 kkal` per serving).
      - Step 03: Eyebrow `FLAVOR` | Title `SIGNATURE NUSANTARA DRESSINGS` | Badge `03` (Copy highlights house-made Green Herb, Savory Peanut/Brown Sauce, and Creamy Black Sesame dressings).
      - Step 04: Eyebrow `SERVE` | Title `SAJI IT YOUR WAY: BOWL OR WRAP` | Badge `04` (Copy highlights enjoying SAJI as a hearty bowl or a convenient on-the-go purple tortilla wrap).

PART 2B: BRAND LIFESTYLE SHOWCASE (1:1 Reference: Image 4 - "COME FOR THE CUP STAY FOR THE MOMENT")
- Layout: 2-Column Asymmetric Split with an overlapping 4-photo lifestyle strip at the bottom.
- Left Column:
  - Eyebrow: `DAILY HEALTHY HABIT`
  - Giant Condensed Headline (`#1E3622`):
    Line 1: `DESERVE A TREAT.`
    Line 2: `NOURISH YOUR`
    Line 3: `BODY EVERY DAY.`
  - CTA Pill Button (Warm Ochre `#F3C677` with offset shadow): `FOLLOW @SAJI.BOWL 🥗`
  - 3 Pill Outline Tags (`border: 1px solid #1E3622`, `border-radius: 999px`, uppercase `12px`):
    `GLUTEN FREE OPTIONS` | `HIGH FIBER & PROTEIN` | `NUSANTARA SOUL`
- Right Column:
  - Large rounded vertical/square lifestyle image (`border-radius: 24px`) featuring SAJI's lifestyle photography (young active customer enjoying SAJI Healthy Wrap & SAJI Healthy Bowl outdoors on a vibrant green lawn with text vibe *"Deserve a Treat, Nourish Your Body"*).
  - On the middle-left inside edge of the photo: 3 vertical circular selector buttons (`01` active in solid Warm Ochre `#F3C677`, `02` and `03` in semi-transparent dark glass) allowing the user to switch the main lifestyle photo between 3 SAJI lifestyle shots.
- Bottom Overlapping 4-Thumbnail Gallery Strip:
  - Positioned horizontally across the lower-left and center, overlapping the main lifestyle image on the right:
  - Thumbnail 1: Close-up hand holding **SAJI Wrap (Sajian Gulung Yogya)** in kraft paper.
  - Thumbnail 2: Lifestyle shot enjoying **SAJI Bowl & Wrap** outdoors on green grass.
  - Thumbnail 3: Close-up pouring signature dressing over **Sajian Bogor** in its wooden bowl.
  - Thumbnail 4 (Highlighted inside a raised Warm Cream `#F7F5F0` padded card frame that overlaps the main right image): Top-down outdoor picnic shot holding a colorful SAJI Bowl (*"Flavorful, fresh, and healthy eats made with Nusantara soul"*).

================================================================================
SECTION 3: KATALOG PRODUCT — SIGNATURE BOWLS & WRAPS
(1:1 Reference: Image 2 - "A LITTLE DIFFERENT. DELICIOUSLY SO.")
================================================================================
- Background: Deep Forest Green (`#1E3622`) with subtle organic dark texture.
- Header Area:
  - Top-Left Eyebrow (Cream `#F7F5F0`, uppercase tracking): `KATALOG PRODUCT • SIGNATURE MENU`
  - Top-Left Giant Display Headline (Warm Ochre `#F3C677`, condensed uppercase):
    Line 1: `A LITTLE DIFFERENT.`
    Line 2: `NUTRITIOUSLY SO.`
  - Top-Right Cluster:
    - 2x4 Checkerboard pixel grid in Nusantara Sage Green (`#A3C193`).
    - Paragraph in Warm Cream (`#F7F5F0`, `max-width: 340px`):
      "We believe healthy food doesn't need to be complicated. It just needs to be honest—locally sourced Nusantara carbs, vibrant fresh toppings, and balanced macros crafted with intention."

- Interactive 4-Card Product Showcase (Trapezoid / Perspective Cards):
  - Layout: 4 product cards arranged horizontally across the container.
  - Visual Behavior (Exact 1:1 with Reference Image 2):
    - Standard inactive cards have a Warm Cream (`#F7F5F0`) slightly tapered/trapezoid card base (`clip-path` or subtle perspective/rounded corners `24px`), with the product image breaking out above the top edge of the card.
    - The **Active / Selected Card** (Default: Card #2 `SAJIAN SUMBA`, or any card clicked by the user) expands in height and width with a **Warm Ochre / Golden (`#F3C677`)** background, revealing interactive customization & nutrition controls inside!
    - Include circular `<` and `>` navigation buttons at the bottom flanking the active expanded card so users can cycle the active spotlight across all 4 SAJI products.

- EXACT PRODUCT DATA FOR THE 4 CARDS:

  1. CARD 1: SAJIAN BOGOR (SAJI BOWL)
     - Category Label on Bowl: `SAJI BOWL • LOCAL ROOTS`
     - Product Visual: Wooden bowl filled with steamed cassava (singkong) base, grilled chicken, purple cabbage, carrots, sweet corn, cucumber, fresh greens, a center cup of creamy black sesame/mushroom dressing, and 3 raw cassava root chunks alongside the bowl.
     - Floating Pill Badge (Nusantara Sage `#A3C193` with `#1E3622` offset shadow):
       Line 1: `ENERGY SOURCE`
       Line 2: `±420 KKAL` (or `RP 38.000`)
     - Card Title (`#1E3622` bold condensed): `SAJIAN BOGOR`
     - Subtitle / Key Ingredients: `Cassava Root Base • Grilled Chicken • Sesame Dressing`
     - Tagline Copy: `"Rediscover local carbs with this nutritious root crop."`
     - Full Macro Breakdown Badge/Row:
       `±420 kkal • ±26 g protein • ±66 g carbs • ±7 g fat • ±7 g fiber`
     - Interactive Controls (shown when card is active/expanded):
       - Base/Style Selector (`S / M / L` style boxes): `REG` (Regular Bowl) | `PRO+` (+Extra Chicken) | `DRESS` (On Side)
       - Satiety / Macro Meter (7-segment bar like `Hot [][][][][][][] Cold`): `Light ▰ ▰ ▰ ▰ ▰ ▰ ▱ Hearty`
     - CTA Button: `ORDER BOWL 🥗`

  2. CARD 2 (DEFAULT EXPANDED FEATURED CARD): SAJIAN SUMBA (SAJI BOWL)
     - Category Label on Bowl: `SAJI BOWL • ANCIENT GRAIN & GLUTEN FREE`
     - Product Visual: Sleek black bowl filled with sorghum grain base, grilled chicken, crispy tempeh strips, sautéed mushrooms, purple sweet potato chips, carrots, cucumber, corn, fresh lettuce, accompanied by a small metal bowl of raw sorghum grains and a cup of green herb dressing.
     - Floating Pill Badge (SAJI Terracotta `#C85A32` with white/cream text and `#1E3622` offset shadow):
       Line 1: `GLUTEN FREE`
       Line 2: `±425 KKAL` (or `RP 42.000`)
     - Card Title (`#1E3622` bold condensed): `SAJIAN SUMBA`
     - Subtitle / Key Ingredients: `Sorghum Ancient Grain • Chicken & Tempeh • Green Herb`
     - Tagline Copy: `"A fiber-rich, gluten-free alternative to everyday carbs"`
     - Full Macro Breakdown Row:
       `±425 kkal • ±31 g protein • ±67 g carbs • ±7 g fat • ±9 g fiber`
     - Interactive Controls (Visible inside the expanded Golden Ochre card):
       - 3 Square Selector Boxes (`border: 1.5px solid #1E3622`, clickable):
         `31g` (Protein) | `67g` (Carbs) | `9g` (Fiber) — OR portion selectors `S` | `M` | `L`.
       - 7-Segment Macro / Energy Bar:
         `Light ▰ ▰ ▰ ▰ ▰ ▰ ▰ High Protein`
     - CTA Button (Crisp Cream `#F7F5F0` pill button with dark offset shadow): `ORDER NOW 🥗`

  3. CARD 3: SAJIAN YOGYA (SAJI BOWL)
     - Category Label on Bowl: `SAJI BOWL • ANTIOXIDANTS RICH & COMPLEX CARBS`
     - Product Visual: Clean white ceramic bowl featuring mashed/steamed purple sweet potato (ubi ungu) at the center, surrounded by grilled chicken, mushrooms, tempeh, diced carrots, corn, cucumber, purple chips, and greens, alongside raw purple sweet potatoes and a cup of savory brown peanut dressing.
     - Floating Pill Badge (Nusantara Sage `#A3C193` with `#1E3622` offset shadow):
       Line 1: `SWEET POTATO BASE`
       Line 2: `±360 KKAL` (or `RP 39.000`)
     - Card Title (`#1E3622` bold condensed): `SAJIAN YOGYA`
     - Subtitle / Key Ingredients: `Purple Sweet Potato • Chicken & Mushroom • Savory Sauce`
     - Tagline Copy: `"A colorful carb swap packed with natural goodness"`
     - Full Macro Breakdown Row:
       `±360 kkal • ±24 g protein • ±57 g carbs • ±5 g fat • ±10 g fiber`
     - CTA Button: `ORDER BOWL 🥗`

  4. CARD 4: SAJIAN GULUNG YOGYA (SAJI WRAP)
     - Category Label on Wrap: `SAJI WRAP • SAJI IT YOUR WAY`
     - Product Visual: Overhead shot of a hand holding a hearty purple sweet potato tortilla wrap bundled in brown kraft paper against a textured kraft backdrop, showing juicy grilled chicken, sweet corn, and crisp green lettuce inside.
     - Floating Pill Badge (SAJI Terracotta `#C85A32` with `#1E3622` offset shadow):
       Line 1: `HEALTHY WRAP`
       Line 2: `ON-THE-GO` (or `RP 35.000`)
     - Card Title (`#1E3622` bold condensed): `SAJIAN GULUNG YOGYA`
     - Subtitle / Key Ingredients: `Purple Ubi Tortilla • Grilled Chicken • Fresh Greens`
     - Tagline Copy: `"- SAJi It Your Way - Convenient, nutrient-packed wrap for busy days."`
     - Full Macro Breakdown Row:
       `±340 kkal • ±22 g protein • ±52 g carbs • ±5 g fat • ±8 g fiber`
     - CTA Button: `ORDER WRAP 🌯`

================================================================================
SECTION 4: CUSTOMER EXPERIENCE & REVIEWS
(1:1 Reference: Image 5 - "A FEW WORDS FROM OUR PEOPLE.")
================================================================================
- Background: Warm Cream (`#F7F5F0`).
- Top-Center Header:
  - Eyebrow: `CUSTOMER EXPERIENCE`
  - Giant Condensed Headline (`#1E3622`, centered):
    Line 1: `A FEW WORDS FROM`
    Line 2: `OUR SAJI PEOPLE.`
- Main Spotlight Testimonial (Middle 2-Column Split):
  - Left Column (Customer Photo Frame):
    - Rounded square photo (`border-radius: 20px`) of a smiling young Indonesian woman holding/eating SAJI Bowl & SAJI Wrap.
    - Solid offset background block on the bottom-left in Warm Ochre (`#F3C677`, `border-radius: 20px`).
  - Right Column (Featured Review Content):
    - Top Row: 5 Star Icons (`★★★★★`) in Warm Ochre / Terracotta (`#E8A855`).
    - Top-Right Decorative Element: Giant double quotation mark (`“ ”`) in soft Nusantara Sage (`#A3C193`, `opacity: 0.6`).
    - Main Review Quote (Bold condensed uppercase in `#1E3622`, `28px–34px`, line-height `1.15`):
      `“SAJI BOWL IS FRESH, FILLING, AND FULL OF NUSANTARA FLAVOR! SWAPPING WHITE RICE FOR SUMBA SORGHUM AND YOGYA PURPLE SWEET POTATO MADE MY DAILY LUNCH FEEL SO MUCH LIGHTER YET ENERGIZING. IT HAS QUICKLY BECOME MY FAVORITE PART OF THE DAY!”`
    - Bottom Controls & Attribution Row:
      - Left: Two circular slider buttons (`<` outline circle button in `#1E3622` and `>` solid `#1E3622` circle button with Warm Ochre offset drop shadow) that dynamically cycle the featured testimonial.
      - Right: Reviewer Name (`Nadia Putri`) in bold `#1E3622` + Role (`Daily SAJI Customer`) in muted green/grey.
- Bottom 3-Column Secondary Review Cards:
  - Each column consists of two stacked elements:
    1. Top Pill Header (`background: #EBE6DA`, `border-radius: 999px`, `padding: 8px 20px 8px 8px`, `display: inline-flex`, avatar image on left + Name & Role on right).
    2. Bottom Review Card (`background: #F2EFE9`, `border-radius: 16px`, `padding: 20px`, `font-size: 13.5px`, `#1E3622`):
  - Card 1:
    - Name: `Raka Pratama` | Role: `Fitness Enthusiast`
    - Text: `"Every bowl feels fresh, macro-balanced, and thoughtfully crafted. Getting 31g of protein and 9g of fiber in Sajian Sumba without feeling heavy is a total game-changer for my daily nutrition."`
  - Card 2:
    - Name: `Clarissa Wijaya` | Role: `Busy Professional`
    - Text: `"I absolutely love the Sajian Gulung Yogya wrap! The purple sweet potato tortilla is soft and flavorful. One wrap is enough to turn a hectic workday lunch into a nourishing treat."`
  - Card 3:
    - Name: `Dimas Aditya` | Role: `Clean Eating Starter`
    - Text: `"From the first bite of Sajian Bogor, I was amazed at how delicious local cassava roots could be when paired with SAJI's signature dressing. Transparent calories make daily healthy eating effortless."`

================================================================================
SECTION 5: CONTACT INFORMATION, SOCIAL MEDIA & DELIVERY PARTNERS
(1:1 Reference: Image 6 - Footer & Bento Contact Cards)
================================================================================
- Top Full-Width Horizontal Marquee Bar:
  - Background: Warm Ochre (`#F3C677`), Text & Starbursts (`✺`) in Deep Forest Green (`#1E3622`):
  - Text: `SAJIAN SUMBA ✺ SAJIAN YOGYA ✺ SAJIAN BOGOR ✺ SAJIAN GULUNG YOGYA ✺ SAJI IT YOUR WAY ✺`
- Main Footer Container:
  - Background: Deep Forest Green (`#1E3622`) with a darker pine organic wave silhouette (`#142617`) across the bottom half.
- Upper Footer Split (Left Floating Products + Right Bento Contact Cards):
  - Left Column (40% width):
    - Dynamic floating product composition featuring **SAJI Bowl** and **SAJI Wrap** tilted at playful angles, surrounded by floating sorghum grains, sliced purple sweet potato, cassava chunks, and fresh green leaves.
  - Right Column (60% width — Bento Grid of 3 Cards):
    - Top Row (2 Cards side-by-side):
      1. Wide Location & Delivery Hub Card (Background: Warm Cream `#F7F5F0`, `border-radius: 20px`, `padding: 28px 32px`, `flex: 1`):
         - Top-Left Eyebrow: `SAJI Kitchen & Online Delivery is here`
         - Top-Right Icon: Bold outline Location Pin icon (`#1E3622`).
         - Bottom-Left Bold Condensed Text (`#1E3622`, `24px–28px`, uppercase):
           Line 1: `JAKARTA, INDONESIA — AVAILABLE ON`
           Line 2: `GRABFOOD, GOFOOD & INSTAGRAM (@SAJI.BOWL)`
      2. Vertical Action Pill Card (Background: Nusantara Sage `#A3C193` or Terracotta `#C85A32`, `border-radius: 20px`, `width: 90px`, clickable link to WhatsApp/Instagram DM):
         - Top: Outline Envelope / Chat Icon.
         - Bottom: Vertical rotated bold uppercase text (`writing-mode: vertical-rl`, `transform: rotate(180deg)`): `SAY HELLO`
    - Bottom Row (1 Full-Width Card):
      3. Wide Operating Hours & Daily Prep Card (Background: Warm Ochre `#F3C677`, `border-radius: 20px`, `padding: 24px 32px`):
         - Top-Left Eyebrow (`#1E3622`): `Freshly prepared for your daily needs`
         - Right Icon: Bold outline Push-Pin icon (`#1E3622`).
         - Bottom-Left Bold Condensed Text (`#1E3622`, `24px–28px`, uppercase):
           Line 1: `MONDAY — SUNDAY`
           Line 2: `08:00 AM — 08:00 PM WIB`

- Lower Footer Navigation & Social Media Row (4 Columns):
  - Column 1 (Brand Identity):
    - Large **SAJi** Logo (in Warm Ochre `#F3C677` / Terracotta `#C85A32`) + `Sajian Healthy Bowl`.
    - Short Tagline in Cream (`#F7F5F0`, `13px`):
      "SAJIan Healthy Bowl For Your Daily Needs! Flavorful, fresh, and healthy eats made with Nusantara soul."
  - Column 2 (`QUICK LINK` in bold uppercase Cream):
    - `Home` (`#hero`)
    - `About Us` (`#about`)
    - `Katalog Product` (`#catalog`)
    - `Customer Experience` (`#reviews`)
  - Column 3 (`ORDER & PARTNERS` in bold uppercase Cream):
    - `GrabFood (SAJI Healthy Bowl)`
    - `GoFood (SAJI Healthy Bowl)`
    - `ShopeeFood`
    - `WhatsApp Direct Order`
  - Column 4 (Social Media & Delivery Circular Buttons + Direct Contact):
    - Row of circular icon buttons (`background: rgba(255,255,255,0.08)`, hover `#C85A32`):
      1. **Instagram** (`@saji.bowl`)
      2. **Grab / GrabFood**
      3. **Gojek / GoFood**
      4. **WhatsApp**
    - Contact Details below icons (Right-aligned or left-aligned in Cream `#F7F5F0`, `13px`):
      - `Instagram: @saji.bowl`
      - `WhatsApp: +62 812-8899-SAJI`
      - `hello@sajibowl.id`

--------------------------------------------------------------------------------
5. TECHNICAL & INTERACTIVE REQUIREMENTS FOR ANTIGRAVITY
--------------------------------------------------------------------------------
1. Interactive Product Catalog (Section 3):
   - Clicking any of the 4 SAJI product cards (`Sajian Bogor`, `Sajian Sumba`, `Sajian Yogya`, `Sajian Gulung Yogya`) or clicking the `<` / `>` arrows must smoothly transition that card into the **Expanded Warm Ochre (`#F3C677`) Featured State**, revealing its macro selector pills, 7-segment energy/satiety bar, and full nutritional breakdown (`kkal`, `protein`, `carbs`, `fat`, `fiber`).
2. Interactive Craft Steps (Section 2A):
   - Clicking steps `01`, `02`, `03`, or `04` at the bottom of the About Us / Craft container must dynamically update the headline, description, step badge number, and visual preview inside the Deep Forest Green showcase box.
3. Interactive Lifestyle & Review Sliders (Section 2B & Section 4):
   - Clicking `01 / 02 / 03` on the lifestyle photo or clicking `< / >` on the Customer Experience section must cycle through SAJI's customer stories and lifestyle visuals with smooth fade/slide animations.
4. Order Modal / Cart Drawer:
   - Clicking `ORDER SAJI`, `ORDER NOW`, or the top-right Cart icon opens a sleek slide-over SAJI Order Drawer where users can adjust quantities of `Sajian Sumba`, `Sajian Yogya`, `Sajian Bogor`, and `Sajian Gulung Yogya`, view their total calories & macros (`Total Kkal` & `Total Protein`), and click **"Checkout via WhatsApp"** or **"Order on GrabFood / GoFood"**.
5. Image Handling:
   - Provide high-resolution visual assets for Logo, Hero bowls/wraps, Lifestyle gallery, and the 4 Catalog cards. Also provide high-craft SVG/CSS bowl & wrap illustrations or curated high-resolution healthy bowl fallback imagery styled with SAJI's curved typography overlays (`SAJI BOWL`, `SAJIAN SUMBA`, `SAJIAN YOGYA`, `SAJIAN BOGOR`, `SAJI WRAP`) so the site looks 100% complete out of the box.

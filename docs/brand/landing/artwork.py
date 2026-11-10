"""Landing-page illustration sources. Called by the parent brand export build."""


def create_scenes(save, text, rect, mark, colors):
    ink = colors["ink"]
    muted = colors["muted"]
    stone = colors["stone"]
    inset = colors["surface-muted"]
    orange = colors["orange"]
    lavender = colors["lavender"]
    white = colors["surface"]

    def label(value, x, y, size=22, weight=400, color=ink):
        return text(value, x, y, size, weight, color)[0]

    def path(d, stroke=ink, width=2, fill="none", extra=""):
        return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'

    def circle(x, y, radius, fill=white, stroke=stone):
        return f'<circle cx="{x}" cy="{y}" r="{radius}" fill="{fill}" stroke="{stroke}"/>'

    def animate(body, delay=0, kind="reveal", duration=650):
        return f'<g data-motion="{kind}" data-delay="{delay}" data-duration="{duration}">{body}</g>'

    def trace(d, delay):
        return path(d, orange, 2, extra=f'data-motion="trace" data-delay="{delay}" data-duration="900"')

    def baseline(number, word):
        return (
            rect(0, 0, 900, 600, white)
            + path("M60 542H840", stone, 1)
            + label(number, 62, 574, 13, 500, orange)
            + label(word, 100, 574, 13, 500, muted)
        )

    # Product advice: an ordinary buying question becomes a useful product match.
    scene = baseline("01", "A LITTLE GUIDANCE. A BETTER FIT.")
    scene += circle(207, 370, 112, inset, "none")
    bag = path("M136 308H260L276 446H120Z", ink, 2, white)
    bag += path("M168 324V290C168 251 228 251 228 290V324", ink, 2.5)
    bag += path("M139 308 151 446M257 308 245 446", stone, 1.5)
    bag += mark(166, 351, 64, ink)
    scene += animate(bag, 100)

    question = rect(72, 76, 338, 114, white, 12, stone)
    question += label("A jacket for", 96, 120, 26, 500)
    question += label("rainy weekends?", 96, 155, 26, 500)
    question += path("M101 190V204L118 190", stone, 1, white)
    scene += animate(question, 0)
    scene += trace("M306 207C306 249 374 249 426 249", 450)
    scene += animate(circle(426, 249, 4, orange, orange), 1200, "accent")

    product = rect(446, 106, 384, 340, white, 12, stone)
    product += label("A GOOD MATCH", 472, 145, 13, 500, orange)
    product += rect(468, 168, 152, 238, inset, 8)
    # A flat, drawn rain shell, with a proper hood, seams and angled pockets.
    product += path("M520 205 534 188H554L568 205 589 218 609 305 588 312 574 266V379H514V266L500 312 479 305 499 218Z", muted, 1.6, "#d6d3d1")
    product += path("M520 205 544 235 568 205M544 235V379M534 188 527 211M554 188 561 211M520 312 533 325M568 312 555 325", muted, 1.4)
    product += path("M537 210H551M514 365H574", muted, 1.4)
    product += label("Rainline", 642, 225, 24, 600)
    product += label("Shell", 642, 255, 24, 600)
    product += label("Waterproof", 642, 293, 17, 400, muted)
    product += rect(638, 315, 168, 36, lavender, 6)
    product += label("Lightweight", 650, 339, 16, 500)
    product += path("M646 378H786M779 371 786 378 779 385", ink, 1.5)
    scene += animate(product, 900)

    response = rect(329, 451, 501, 70, white, 10, stone)
    response += circle(357, 486, 12, lavender, "none")
    response += path("M352 486 356 490 363 482", ink, 1.7)
    response += label("Made for the forecast.", 382, 494, 24, 500)
    scene += animate(response, 1800)
    save("landing/product-advice.svg", 900, 600, scene, "Illustrative product advice: a question about rainy weekends leads to a waterproof Rainline Shell recommendation.")

    # Grounding: visible sources and a citation, not an abstract AI magic effect.
    scene = baseline("02", "GOOD ANSWERS HAVE SOMETHING BEHIND THEM.")
    back = rect(82, 147, 228, 295, lavender, 8, stone)
    back += label("Store policies", 104, 187, 19, 500)
    back += path("M107 216H267M107 234H254M107 252H270", "#c7bdcf", 2)
    scene += animate(f'<g transform="rotate(-8 196 294)">{back}</g>', 100)

    guide = rect(140, 109, 234, 323, white, 8, stone)
    guide += path("M164 132H183L191 140V164H164ZM183 132V141H191", muted, 1.4)
    guide += label("Product guide", 164, 203, 23, 600)
    guide += label("Rainline Shell", 164, 234, 17, 400, muted)
    guide += path("M164 268H345M164 286H332", stone, 3)
    guide += rect(160, 306, 193, 39, inset, 3)
    guide += rect(160, 306, 3, 39, orange)
    guide += label("Waterproof outer", 173, 331, 17, 500)
    guide += path("M164 370H337M164 388H300", stone, 3)
    scene += animate(guide, 350)
    scene += trace("M375 325H402Q420 325 420 300V281H503", 800)
    scene += animate(circle(439, 281, 27, white, stone) + mark(421, 262, 36), 1150)

    answer = rect(504, 147, 326, 310, white, 12, stone)
    answer += label("BUILT ON YOUR KNOWLEDGE", 528, 180, 12, 500, orange)
    answer += label("An answer you", 528, 232, 27, 600)
    answer += label("can check.", 528, 267, 27, 600)
    answer += label("A waterproof shell.", 528, 316, 20)
    answer += label("Details from your guide.", 528, 347, 20, 400, muted)
    scene += animate(answer, 1250)
    citation = rect(528, 380, 278, 47, lavender, 6)
    citation += label("Source: product guide", 543, 410, 17, 500)
    citation += path("M783 408 792 399M783 399H792V408", ink, 1.5)
    scene += animate(citation, 2050)
    save("landing/grounded-answers.svg", 900, 600, scene, "Illustrative grounded answer: a product guide and store policy connect to an answer with a product-guide citation.")

    # Handoff: review stays explicit; email is the follow-up channel, not live chat.
    scene = baseline("03", "SHOPPERS REVIEW. STAFF FOLLOW UP BY EMAIL.")
    review = rect(72, 83, 338, 427, white, 12, stone)
    review += label("READY FOR REVIEW", 98, 122, 13, 500, orange)
    review += label("Exchange enquiry", 98, 164, 26, 600)
    review += path("M98 190H384", stone, 1)
    for y, title in ((236, "Order details"), (293, "Requested size"), (350, "Shopper email")):
        review += rect(98, y - 20, 28, 28, lavender, 5)
        review += path(f"M105 {y - 6}L111 {y}L120 {y - 12}", ink, 1.6)
        review += label(title, 143, y, 22)
    review += rect(98, 403, 286, 58, ink, 6)
    review += label("Review before sending", 118, 440, 20, 500, white)
    scene += animate(review, 0)
    scene += trace("M426 294H504Q526 294 526 272V255Q526 236 548 236H577", 800)
    scene += animate(path("M569 229 577 236 569 243", orange, 2), 1600)

    # The sheet and envelope remain separate layers to suggest a prepared summary.
    envelope_back = path("M588 250 704 167 820 250V398H588Z", ink, 1.8, inset)
    scene += animate(envelope_back, 1200)
    sheet = rect(609, 179, 190, 188, white, 6, stone)
    sheet += mark(628, 195, 34)
    sheet += label("Request summary", 628, 259, 17, 500)
    sheet += path("M628 282H774M628 300H754M628 318H766", stone, 2)
    scene += animate(sheet, 1500)
    envelope = path("M588 250 704 326 820 250V398H588Z", ink, 1.8, white)
    envelope += path("M588 398 671 305M820 398 737 305", stone, 1.5)
    envelope += rect(692, 348, 25, 25, lavender, 4)
    envelope += mark(697, 351, 15)
    scene += animate(envelope, 1650)
    caption = label("Staff follow up", 589, 456, 27, 600)
    caption += label("by email.", 589, 492, 27, 600, orange)
    scene += animate(caption, 2200)
    save("landing/human-handoff.svg", 900, 600, scene, "Illustrative handoff: a shopper reviews order details, requested size and contact email; a request summary supports staff follow-up by email.")

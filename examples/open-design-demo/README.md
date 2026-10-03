# Open Design demonstration

A standalone Chinese page based on [Open Design's Airbnb-inspired system](https://github.com/nexu-io/open-design/blob/main/design-systems/airbnb/DESIGN-zh.md).

```sh
node examples/open-design-demo/build.mjs
```

Open the generated `index.html` directly. The page embeds its font, photographs, styles, and JavaScript and makes no network requests during ordinary use. The generated file is ignored; the editable sources and original assets are committed.

Three views demonstrate the photo-led interface, typography roles, and foreground/background contrast. Category filtering, session favorites, photo details, annotations, type scaling, font selection, and color presets work locally. Space names are illustrative copy; the page contains no booking or transaction flow.

Adaptations: Inter replaces the proprietary Cereal font; Chinese falls back to the user's system fonts. Paragraphs use the source's 1.43 reading guidance. The main action uses its deeper coral token, `#e00b41`, to meet the ordinary white-text AA threshold. The contrast experiment compares unrounded WCAG ratios with the threshold appropriate to the sample's size and weight.

Photographs used under the Unsplash License:

- [GoodLifeConstruction — modern living room](https://unsplash.com/photos/modern-living-room-with-minimalist-furniture-and-decor-e0oJLc5FYsg)
- [Ahmet Yüksek — snowy cabin](https://unsplash.com/photos/wooden-cabin-in-a-snowy-forest-setting-UpBjQiy7SZU)
- [Costa Live — minimalist sofa](https://unsplash.com/photos/a-modern-gray-sectional-sofa-in-a-minimalist-room-MRx-rSdOKtk)

Inter is licensed under the SIL Open Font License; `assets/inter-LICENSE.txt` is also embedded in the output.

# Lucily

Ancient Kira’s personal website: projects, Minecraft modding, web design, and more. Built with plain HTML, CSS, and JavaScript for GitHub Pages—no installation or build step required.

[Visit the website](https://ancientkira21.github.io/) · [Projects](https://ancientkira21.github.io/projects/) · [About](https://ancientkira21.github.io/about/)

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Home and “What I Do” |
| `projects/index.html` | Searchable project gallery with category filters and sorting |
| `about/index.html` | About Ancient Kira, interests, and Patreon support |
| `mcaihelp.html` | MCA Remastered AI conversation guide |
| `404.html` | Custom not-found page |

The gallery includes status indicators, equal-height cards, and action buttons that wrap when space is limited. The site also includes mobile navigation and a floating back-to-top button.

## Preview locally

From the repository directory, run:

```zsh
python3 -m http.server 8000
```

Open [localhost:8000](http://localhost:8000/). Stop the server with **Ctrl+C**.

Individual HTML files can be opened directly, but navigation links such as `/projects/` expect a web server. Google Fonts and Font Awesome also require an internet connection.

## Customize the site

### Content and styling

Edit the HTML file for the page you want to change. Shared assets live in `assets/`:

| File | Purpose |
| --- | --- |
| `style.css` | Styling from the original reference design |
| `site.css` | Lucily-specific layout and styling adjustments |
| `categories.js` | Category names and icons |
| `project-icons.js` | Optional project-specific preview icons |
| `gallery.js` | Search, filtering, sorting, and icon rendering |
| `back-top.js` | Back-to-top visibility and scrolling |
| `lucily.svg` | Lucily logo and browser-tab icon |
| `happy-mac.svg` | Monochrome Happy Mac adaptation used on About |

The Happy Mac preview on Projects is defined inline in `project-icons.js`; update both copies when changing that artwork.

### Add a category

Add an entry to `assets/categories.js`:

```js
{ id: 'Tools', name: 'Tools', icon: 'fa-solid fa-screwdriver-wrench' },
```

Use that exact ID in a project card’s `data-category="Tools"`. Filters and image badges are generated from this list. Icons can use Font Awesome classes (`icon`), inline SVG (`svg`), or an image URL (`image`). Inline SVGs should use `currentColor` to inherit the surrounding tint.

### Add a project

Copy an existing card in `projects/index.html` and update:

- `data-name`: the project name used for sorting.
- `data-category`: an ID from `categories.js`.
- `data-order`: its position in the featured order.
- `data-active`: `true` or `false` for active-first sorting.
- The title, description, status text and color, preview, and button links.

Update the hero’s project total and initial result count when adding or removing projects. Search and filter result counts update automatically after interaction.

For a custom preview icon, add an entry to `assets/project-icons.js` and set the card’s `data-icon` to its key. Without a matching entry, the preview uses the category icon. Category badges keep their category icons.

Keep action buttons inside `.theme-actions`; they automatically wrap into additional rows. Use `.btn-download` for the existing gradient button style and include an icon with each action.

### Top badges

The blue badges above the page headings are commented out in the HTML. Uncomment the corresponding `.badge` element to restore one.

## Credits

- **Website design:** adapted from [My Simple OC Themes by chris1111](https://chris1111.github.io/My-Simple-OC-Themes/), with tweaks for Lucily.
- **Interface icons:** [Font Awesome Free](https://fontawesome.com/), under its [Free license](https://fontawesome.com/license/free).
- **Android icon:** Google’s [2023–present robot head](https://commons.wikimedia.org/wiki/File:Android_Robot_Head_2023.svg), adapted for monochrome display. Android is a trademark of Google LLC.
- **Remastered Happy Mac logo:** [u/Zulimations’ original Reddit post](https://www.reddit.com/r/mac/comments/dtpac6/i_made_a_remastered_happy_mac_logo_feel_free_to/), redrawn as a simplified monochrome SVG and recolored for this site.
- **Lucily symbol:** custom SVG artwork created for this website.

Review credits whenever changing designs, icons, or other assets. Keep visible asset credits on the pages that actually use those assets, above the GitHub Pages and Apache license text.

## Support

Support Ancient Kira through [Patreon membership](https://www.patreon.com/AncientKira/membership). Support is optional; projects remain ad-free without paid VIP features.

## License

Site code is licensed under [Apache License 2.0](LICENSE). Third-party artwork, trademarks, fonts, and icons remain subject to their respective terms.

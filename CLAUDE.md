# Intent

SPML files (`*.spml`, `*.spt`) are JSP-style templates. They mix HTML with tags
from Sitepark's in-house taglib (`sp:`, `spt:`). Attribute values often hold
SPEL expressions (`${…}`, `!{…}`). Files also contain JSP directives (`<%@ … %>`)
and comments (`<%-- … --%>`).

This extension brings lspml to VS Code. Editing an SPML file should feel like
editing HTML, plus everything lspml knows about SPML.

## Who provides what

| Concern | Provided by |
|---|---|
| SPML language intelligence: completion, hover, diagnostics, go to definition, semantic tokens, code actions | **lspml**, the Rust language server ([DrWursterich/lspml](https://github.com/DrWursterich/lspml)) |
| HTML editing: tag/attribute completion for HTML, auto-closing tags, auto-quotes, linked tag editing | **VS Code's built-in HTML language features**, joined via `htmlLanguageParticipants` in `package.json` |
| Highlighting | TextMate grammar `text.html.spml`: SPML/JSP rules layered over `text.html.basic` |
| Glue: shipping the server binary per platform, settings, log forwarding, restart | **this extension** |

## Rules that follow

- **SPML features belong in lspml.** lspml is maintained mainly for Neovim and
  is the single source of truth for SPML. Fix missing or wrong SPML behaviour
  in lspml, so Neovim users get the fix too. The extension's own code stays glue.
- **An SPML tag itself belongs to lspml.** On the tag name, its attributes and
  their values, lspml alone provides suggestions. That's why
  `spml.html.customData.json` lists the `sp:`/`spt:` tags without `attributes`:
  HTML then suggests no attributes on them. The HTML server logs a `forEach`
  error for each such request. That error is expected; adding `"attributes": []`
  would make HTML suggest its global attributes (`accesskey`, `onclick`, …) on
  every SPML tag.
- **`void` in `spml.html.customData.json` means "practically always
  self-closed".** HTML inserts no closing tag for a void tag and treats it as
  closed, so `</` inside one closes the surrounding tag. A tag is void when it
  has no content in real templates (or only a handful of exceptions), or when
  lspml defines it with `TagChildren::None` (`crates/lspml-grammar`) and real
  templates agree. Real templates win over lspml: `spt:ilink` and
  `spt:personalization` have content in practice. `sp:set`, `sp:map` and
  `sp:textarea` are void by choice, although templates write them with content
  too. `sp:argument`, `sp:include`, `sp:select` and `sp:option` stay
  non-void. The file lists every lspml tag plus taglib tags lspml doesn't know
  yet.
- **Content keeps full HTML support, however deeply it's nested in SPML.** HTML
  inside `<sp:if>`, `<sp:loop>` etc. is edited exactly like in an `.html` file.
- **Editing mechanics apply to all tags.** Auto-closing, auto-quotes and linked
  tag editing work the same for `<div>` and `<sp:if>`.
- **For HTML and generic editing, reuse VS Code's HTML support.** Write custom
  code only where SPML syntax breaks it, e.g. `<%-- --%>` comments or tags
  inside attribute values.

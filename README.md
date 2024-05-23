<h1 align="center">
  <br>
    <img src="https://www.sitepark.com/icon-512.png" alt="logo" width="200">
  <br>
  Sitepark Markup Language (<a href="https://wiki.sitepark.com/index.php/Kategorie:Tag-Referenz" target="_blank" />SPML</a>)
  <br>
  <br>
</h1>

### The core functionality is provided by [lspml](https://github.com/DrWursterich/lspml), a dedicated language server written in Rust. ⭐

![example-video](./docs/example.webp)

**Supported features:**

- go to definition for variables and `<sp:include>` tag `uri` attributes
- hover for documentation of
    - most tags
    - most attributes
    - attribute enum values
    - global functions in spel attribute values
- diagnostics on:
    - syntax errors
    - misplaced, unclosed and deprecated tags
    - duplicate, required and deprecated attributes / tag-bodies
    - nonexistent files in `<sp:include>` and similar tags
    - sitepark expression language (spel):
        - syntax errors
        - nonexistent global functions
        - incorrect argument counts for global functions
- completion for:
    - tags
    - `</`, closing the last unclosed tag
    - attributes
    - attribute values that either:
        - have a fixed set of possible values
        - point to another spml file
        - refer to an spml module
- semantic highlighting for attribute values that expect:
    - conditions
    - expressions
    - identifiers
    - objects
    - regular expressions
    - text
    - uris
    - to be comparable (for `<sp:if>` and `<sp:elseif>` `eq`/`gt`/...)
- code actions to:
    - generate a default file header
    - fix small spel syntax errors (`quickfix`)
    - fix all `quickfix`-able errors at once (`source.fixAll`)
    - split `<sp:if>` `condition` into `name` and `eq`/`gt`/`isNull`/...
    - join `<sp:if>` `name` and `eq`/`gt`/`isNull`/... into `condition`


## Getting Started
1. Install the extension
2. Change File association for `*.spml` files to spml

## Configuration
For the path completion of the `uri` attribute of `sp:include`, a mapping from module ID to file system path must be defined in the settings.

Open the Settings and go to the SPML section and declare a module-mapping.

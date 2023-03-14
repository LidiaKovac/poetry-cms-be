const clean = (text) => {
  let HTML = [
    "<pagebreak>",
    "<!--...-->",
    "<!doctype>",
    "<a>",
    "<abbr>",
    "<acronym>",
    "<address>",
    "<applet>",
    "<area>",
    "<article>",
    "<aside>",
    "<audio>",
    "<b>",
    "<base>",
    "<basefont>",
    "<bb>",
    "<bdo>",
    "<big>",
    "<blockquote>",
    "<body>",
    "<br />",
    "<br>",
    "<button>",
    "<canvas>",
    "<caption>",
    "<center>",
    "<cite>",
    "<code>",
    "<col>",
    "<colgroup>",
    "<command>",
    "<datagrid>",
    "<datalist>",
    "<dd>",
    "<del>",
    "<details>",
    "<dfn>",
    "<dialog>",
    "<dir>",
    "<div>",
    "<dl>",
    "<dt>",
    "<em>",
    "<embed>",
    "<eventsource>",
    "<fieldset>",
    "<figcaption>",
    "<figure>",
    "<font>",
    "<footer>",
    "<form>",
    "<frame>",
    "<frameset>",
    "<h1>",
    "<h2>",
    "<h3>",
    "<h4>",
    "<h5>",
    "<h6>",
    "<head>",
    "<header>",
    "<hgroup>",
    "<hr />",
    "<html>",
    "<i>",
    "<iframe>",
    "<img>",
    "<input>",
    "<ins>",
    "<isindex>",
    "<kbd>",
    "<keygen>",
    "<label>",
    "<legend>",
    "<li>",
    "<link>",
    "<map>",
    "<mark>",
    "<menu>",
    "<meta>",
    "<meter>",
    "<nav>",
    "<noframes>",
    "<noscript>",
    "<object>",
    "<ol>",
    "<optgroup>",
    "<option>",
    "<output>",
    "<p>",
    "<param>",
    "<pre>",
    "<progress>",
    "<q>",
    "<rp>",
    "<rt>",
    "<ruby>",
    "<s>",
    "<samp>",
    "<script>",
    "<section>",
    "<select>",
    "<small>",
    "<source>",
    "<span>",
    "<strike>",
    "<strong>",
    "<style>",
    "<sub>",
    "<sup>",
    "<table>",
    "<tbody>",
    "<td>",
    "<textarea>",
    "<tfoot>",
    "<th>",
    "<thead>",
    "<time>",
    "<title>",
    "<tr>",
    "<track>",
    "<tt>",
    "<u>",
    "<ul>",
    "<var>",
    "<video>",
    "<wbr>",
    "</pagebreak>",
    "</!--...-->",
    "</!doctype>",
    "</a>",
    "</abbr>",
    "</acronym>",
    "</address>",
    "</applet>",
    "</area>",
    "</article>",
    "</aside>",
    "</audio>",
    "</b>",
    "</base>",
    "</basefont>",
    "</bb>",
    "</bdo>",
    "</big>",
    "</blockquote>",
    "</body>",
    "</br />",
    "</br>",
    "</button>",
    "</canvas>",
    "</caption>",
    "</center>",
    "</cite>",
    "</code>",
    "</col>",
    "</colgroup>",
    "</command>",
    "</datagrid>",
    "</datalist>",
    "</dd>",
    "</del>",
    "</details>",
    "</dfn>",
    "</dialog>",
    "</dir>",
    "</div>",
    "</dl>",
    "</dt>",
    "</em>",
    "</embed>",
    "</eventsource>",
    "</fieldset>",
    "</figcaption>",
    "</figure>",
    "</font>",
    "</footer>",
    "</form>",
    "</frame>",
    "</frameset>",
    "</h1>",
    "</h2>",
    "</h3>",
    "</h4>",
    "</h5>",
    "</h6>",
    "</head>",
    "</header>",
    "</hgroup>",
    "</hr />",
    "</html>",
    "</i>",
    "</iframe>",
    "</img>",
    "</input>",
    "</ins>",
    "</isindex>",
    "</kbd>",
    "</keygen>",
    "</label>",
    "</legend>",
    "</li>",
    "</link>",
    "</map>",
    "</mark>",
    "</menu>",
    "</meta>",
    "</meter>",
    "</nav>",
    "</noframes>",
    "</noscript>",
    "</object>",
    "</ol>",
    "</optgroup>",
    "</option>",
    "</output>",
    "</p>",
    "</param>",
    "</pre>",
    "</progress>",
    "</q>",
    "</rp>",
    "</rt>",
    "</ruby>",
    "</s>",
    "</samp>",
    "</script>",
    "</section>",
    "</select>",
    "</small>",
    "</source>",
    "</span>",
    "</strike>",
    "</strong>",
    "</style>",
    "</sub>",
    "</sup>",
    "</table>",
    "</tbody>",
    "</td>",
    "</textarea>",
    "</tfoot>",
    "</th>",
    "</thead>",
    "</time>",
    "</title>",
    "</tr>",
    "</track>",
    "</tt>",
    "</u>",
    "</ul>",
    "</var>",
    "</video>",
    "</wbr>",
  ] //list of all HTML tags
  let INLINE = [
    "<b>",
    "<big>",
    "<i>",
    "<small>",
    "<tt>",
    "<abbr>",
    "<acronym>",
    "<cite>",
    "<code>",
    "<dfn>",
    "<em>",
    "<kbd>",
    "<strong>",
    "<samp>",
    "<var>",
    "<a>",
    "<bdo>",
    "<br>",
    "<img>",
    "<map>",
    "<object>",
    "<q>",
    "<script>",
    "<span>",
    "<sub>",
    "<sup>",
    "<button>",
    "<input>",
    "<label>",
    "<select>",
    "<textarea>",
    "</b>",
    "</big>",
    "</i>",
    "</small>",
    "</tt>",
    "</abbr>",
    "</acronym>",
    "</cite>",
    "</code>",
    "</dfn>",
    "</em>",
    "</kbd>",
    "</strong>",
    "</samp>",
    "</var>",
    "</a>",
    "</bdo>",
    "</br>",
    "</img>",
    "</map>",
    "</object>",
    "</q>",
    "</script>",
    "</span>",
    "</sub>",
    "</sup>",
    "</button>",
    "</input>",
    "</label>",
    "</select>",
    "</textarea>",
  ]
  text = text
    .replaceAll("<br>", "\\n")
    .replaceAll("<br />", "\\n")
    .replaceAll("<br/>", "\\n")
  for (const tag of HTML) {
    if (INLINE.includes(tag)) {
      text = text.replaceAll(`${tag}`, "")
    } else {
      if (tag.includes("/")) text = text.replaceAll(`${tag}`, "\\n")
      else text = text.replaceAll(`${tag}`, "")
    }
  }
  let foreignTags = text.split("<")
  for (let i = 0; i < foreignTags.length; i++) {
    let piece = foreignTags[i]
    if (piece.includes("<") || piece.includes(">") || piece.includes("/")) {
      //it's a tag
      
      if (piece.includes(">")) {
        foreignTags[i] = foreignTags[i].replaceAll(piece.split(">")[0], "")
      } else foreignTags[i] = ""
    }
  }
  //   text = text.replaceAll("<>", "").replaceAll(">>", "").replaceAll("/>", "")
  return foreignTags.join(" ").replaceAll(/[$&+=?@#|<>^*%]/g, "")
}

const findTitleAndPoem = (fileToString) => {
  let title,
    text = ""
  fileToString = fileToString.replaceAll("\\r>", "\\n")
  //get tag used for the title
  let counter = 0
  while (fileToString.split(">")[counter].includes("<")) {
    if (
      fileToString.split(">")[counter].includes("<") &&
      fileToString.split(">")[counter].includes("</") &&
      !title
    ) {
      title = clean(fileToString.split(">")[counter] + ">")
      continue
    } else if (fileToString.split(">")[counter].includes("<") && title) {
      text += clean(fileToString.split(">")[counter+1] + ">")
      //   break
    }
    counter++
  }
  if(!title || !text) {
    let cleanedText = clean(fileToString)
    for (let i = 0; i < cleanedText.split("\n").length; i++) {
        const line = cleanedText.split("\n")[i]
        if(line === " " || line === "") continue
        else if(!title) {
            title = line 
        } else {
            text += line + "\\n"
        }
    }
  }
  console.log()
  console.log("TITLE", title)
  console.log("TEXT", text)

  //general cleaning

  //   console.log(fileToString)
  //   if (fileToString.includes("<big>")) {
  //     title = getCapitalizedName(
  //       fileToString.split("<big>")[1].split("</big>")[0]
  //     )
  //   } else if (fileToString.includes("<h1>")) {
  //     title = getCapitalizedName(fileToString.split("<h1>")[1].split("</h1>")[0])
  //   } else if (fileToString.includes("<b>")) {
  //     title = getCapitalizedName(fileToString.split("<b>")[1].split("</b>")[0])
  //   } else {
  //     title = fileToString?.split("\n")[0] || "Untitled"
  //   }
  //   if (fileToString.includes("<poem>")) {
  //     text = fileToString.split("<poem>")[1].split("</poem>")[0]
  //   } else if (fileToString.length > 0) {
  //     text = fileToString.replaceAll("<sp>>", "").replaceAll("</sp>", "")
  //   }
  //   console.log(title, text)
}

findTitleAndPoem(`
<h1>Brev från min syster</h1>

<p><dl>
<dt>Brev från min syster.
<dt>Vad kunna brev säga,
<dt>då jag ser dig!
<dt>Faller ej håret lätt omkring dig i gyllne vågor
<dt>då du träder in
<dt>för att berätta mig ditt liv?
<dt>Stelna ej dina fållar av hänförelse då du går?
<dd>    Jorden bär dig.
<dt>- - - - - - - - - - - - - - - - - -
<dt>Varför hava ej alla ögon att se det,
<dt>varför öser en enda hand ur gudarnas brunn?
<dt>Syster, min syster.
<dt>Jag har fått din bild.
</dl>
`)

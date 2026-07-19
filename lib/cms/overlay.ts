// lib/cms/overlay.ts
// Inject the editor overlay into rendered HTML. Elements carry data-slot
// attributes from ingest; here we make them hover-highlight and click-editable.
// On commit, the overlay posts { slotId, newValue } to the parent window
// (the Studio dashboard), which runs it through the Guardian.

export function injectOverlay(html: string, channelNonce: string): string {
  if (!/^[a-zA-Z0-9_-]{32,128}$/.test(channelNonce)) {
    throw new Error("Invalid CMS editor channel nonce.");
  }
  const serializedChannelNonce = JSON.stringify(channelNonce).replace(/</g, "\\u003c");
  const overlay = `
<style>
  [data-slot]{ outline:1px dashed transparent; transition:outline-color .12s; cursor:pointer; }
  [data-slot]:hover,[data-slot]:focus-visible{ outline-color:#6366f1; outline-width:2px; }
  [data-slot].editing{ outline:2px solid #6366f1; background:rgba(99,102,241,.08); }
  #__cms_hint{ position:fixed; bottom:10px; left:10px; z-index:2147483647;
    font:12px system-ui,sans-serif; background:#111827; color:#fff;
    padding:6px 10px; border-radius:6px; opacity:.92; }
</style>
<div id="__cms_hint">Click a field, or focus it and press Enter, to edit. Esc cancels; Enter or blur saves.</div>
<script nonce="${channelNonce}">
(function(){
  var channelNonce = ${serializedChannelNonce};
  var parentOrigin = null;
  try { parentOrigin = new URL(document.referrer).origin; } catch (_) {}
  function send(slotId, newValue, selectOnly){
    if (!parentOrigin) return;
    parent.postMessage({ __cms:true, channelNonce:channelNonce, slotId:slotId, newValue:newValue, selectOnly:selectOnly===true }, parentOrigin);
  }
  document.querySelectorAll("[data-slot]").forEach(function(el){
    var slotId = el.getAttribute("data-slot");
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "0");
    if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", "Edit this page field");
    function beginEdit(ev){
      ev.preventDefault(); ev.stopPropagation();
      if (el.tagName === "IMG"){
        send(slotId, el.getAttribute("src")||"", true);
        return;
      }
      if (el.classList.contains("editing")) return;
      var original = el.textContent;
      el.classList.add("editing");
      el.setAttribute("contenteditable","true");
      el.focus();
      function done(save){
        el.classList.remove("editing");
        el.removeAttribute("contenteditable");
        var val = el.textContent;
        el.textContent = original;
        if (save && val !== original) send(slotId, val);
        el.removeEventListener("keydown", onKey);
        el.removeEventListener("blur", onBlur);
      }
      function onKey(e){
        if (e.key === "Enter"){ e.preventDefault(); done(true); }
        else if (e.key === "Escape"){ e.preventDefault(); done(false); }
      }
      function onBlur(){ done(true); }
      el.addEventListener("keydown", onKey);
      el.addEventListener("blur", onBlur);
    }
    el.addEventListener("click", beginEdit, true);
    el.addEventListener("keydown", function(ev){
      if (!el.classList.contains("editing") && (ev.key === "Enter" || ev.key === " ")) beginEdit(ev);
    });
  });
})();
</script>`;
  if (/<\/body\s*>/i.test(html)) return html.replace(/<\/body\s*>/i, overlay + "</body>");
  return html + overlay;
}

export function summarizeSlots(contentMap: Record<string, { type: string; value: unknown }>) {
  return Object.entries(contentMap).slice(0, 50).map(([id, s]) => ({
    id,
    type: s.type,
    value: typeof s.value === "string" && s.value.length > 60 ? s.value.slice(0, 60) + "…" : s.value,
  }));
}

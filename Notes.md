
| Feature                       | Supported in Web Speech API? | Notes                      |
| ----------------------------- | ---------------------------- | -------------------------- |
| Resume from middle            | ❌                            | Only by manual tracking    |
| Change voice mid-speech       | ❌                            | Needs splitting & queueing |
| Change speed/pitch mid-speech | ❌                            | Same as above              |
| Track position during speech  | ✅                            | Use `onboundary`           |

### voiceschanged

- `speechSynthesis.getVoices()` returns the list of available voices.
- However, voices may not be loaded immediately when the page loads.
- The speechSynthesis.onvoiceschanged event signals when the voices are loaded or updated.

> The `voiceschanged` event of the Web Speech API is fired when the list of SpeechSynthesisVoice objects that would be returned by the `SpeechSynthesis.getVoices()` method has changed (when the voiceschanged event fires.)

- Calling `getVoices()` early can return an empty array because voices aren't loaded yet.
- The browser triggers onvoiceschanged when voices become available.
- So listen to that event to get the full and updated list.

### Why does the `voiceschanged` event fire *only once* or sometimes not?

- The browser **loads the voices asynchronously**.
- The `voiceschanged` event fires **when the voices list is first populated or updated**.
- However, browsers typically **fire `voiceschanged` only once**, and **only if `getVoices()` has been called at least once before**.
  
### What this means in practice:

- If you **never call** `speechSynthesis.getVoices()` or do so *too late*, some browsers might **never fire the `voiceschanged` event** because they assume the voices are not requested.
- Calling `getVoices()` triggers **the browser to start loading the voices** and thus will cause the `voiceschanged` event to fire when voices are ready.
- This is why the common pattern is:
  1. Call `getVoices()` once immediately (even if empty),
  2. Listen for `voiceschanged` event to update the voices list.

### In other words:

- The event **doesn't "just fire by itself"** — the browser dispatches it **when voices change or become available**, triggered by calling `getVoices()` (or initiating speech synthesis usage).
- If you don't call `getVoices()`, the internal voice loading might not start, so `voiceschanged` might *never trigger* in some browsers.

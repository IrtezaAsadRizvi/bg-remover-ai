# 🖼️ Background Remover (Browser‑Only)

A fast, private, **serverless background remover** that runs 100% in the browser. No uploads, no accounts, no tracking - just drop an image and download a transparent PNG. ✨

Built with **Vite + React + TypeScript + Tailwind CSS** and powered by **ONNX Runtime Web** running in a **Web Worker** for smooth UI performance.

![Background Remover cover](https://i.ibb.co.com/jPnDnVg7/bg-remover-git-cover.jpg)

## 🌍 Live

https://bgremover-ai.web.app/

---

## ✅ Highlights

- **🧠 AI background removal in the browser** (ONNX models)
- **🔒 Private & secure** - images never leave your device
- **⚡ Fast** - worker‑based inference keeps the UI responsive
- **💸 Free** - no login, no subscriptions, no limits
- **🧩 Two models**: U^2‑Net Human Seg & ISNet General
- **🎛️ Tunable controls**: input size, threshold, feather
- **📥 Export**: instant transparent PNG download

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open the app, upload an image, choose a model, and hit **Remove Background**.

---

## 🧠 Models (ONNX)

Place your models in the `public/models` folder:

```
public/models/u2net-human.onnx
public/models/isnet-general.onnx
```

### Model Tips

- **U^2‑Net Human Seg** → best for portraits, people, and hair detail
- **ISNet General** → best for products, objects, and mixed scenes

> ⚠️ These models are large (100–300MB). Expect a one‑time download when the browser loads them.

---

## ⚙️ Controls Explained

- **Input Size** → higher = more detail but slower
- **Threshold** → lower = keeps more of the subject, higher = cleaner cutout
- **Feather** → softens edges for smoother results

---

## 🔒 Privacy & Security

This tool is **fully serverless**:

✅ No uploads
✅ No accounts
✅ No analytics
✅ No tracking
✅ No data storage

Everything runs locally in your browser - your images stay private.

---

## ⚡ Performance Notes

- Inference runs inside a **Web Worker** to avoid blocking the UI.
- `onnxruntime-web` loads WASM assets from `public/ort`.

Required files (copy from `node_modules/onnxruntime-web/dist`):

```
public/ort/ort-wasm-simd-threaded.mjs
public/ort/ort-wasm-simd-threaded.wasm
public/ort/ort-wasm-simd-threaded.jsep.mjs
public/ort/ort-wasm-simd-threaded.jsep.wasm
public/ort/ort-wasm-simd-threaded.asyncify.mjs
public/ort/ort-wasm-simd-threaded.asyncify.wasm
```

---

## 🧩 Tech Stack & Keywords

**Keywords:** background remover, AI image cutout, PNG transparent, on-device segmentation, browser AI, onnxruntime-web, u2net human, isnet general, privacy-first, serverless, no login, free background removal.

**Stack:**
- Vite
- React + TypeScript
- Tailwind CSS
- ONNX Runtime Web
- Web Workers

---

## ❓ FAQ

**Q: Is this free?**
Yes - completely free and runs locally in your browser.

**Q: Do my images upload to a server?**
No. All processing happens on your device.

**Q: What format is the output?**
Transparent PNG.

**Q: Which model should I use?**
Try **U^2‑Net Human** for people. Use **ISNet General** for objects/products.

---

## 🙌 Credits

Models are ONNX‑compatible segmentation networks. You provide the ONNX files; the app runs them locally with ONNX Runtime Web.

---

If you find this useful, consider sharing it. Happy editing! 🎉

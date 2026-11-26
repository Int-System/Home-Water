# Home-Water: สรุปส่งต่อสำหรับแชตใหม่

เว็บแบบบ้านยกสูงหนีน้ำ (ภาษาไทย) มีภาพ 3D ภาพนิ่ง ผังพื้น รูปด้าน ผังเสา งานไฟฟ้าประปา รายการวัสดุ (BOQ) งวดงาน และเอกสารสำหรับช่าง (พิมพ์ / PDF)
ล่าสุดคือ **ฉบับ 46** (26 พ.ย. 2569) หัวเว็บแสดง "อัปเดต <วันที่>" แทนเลขฉบับ แก้วันที่ทุกครั้งที่ขึ้นเว็บใหม่ (ค้นคำว่า `อัปเดต` ใน `light/page.html`)

## ลิงก์และที่เก็บ

| อะไร | อยู่ที่ |
|---|---|
| เว็บหลัก (artifact) | https://claude.ai/artifact/8txSDGev9DijTy1dq3tqCy ไฟล์ `page.html` + `data/*.json` 492 ไฟล์ (รวม 493 ไฟล์, ~246 MiB) |
| GitHub Pages | https://int-system.github.io/Home-Water/ (repo `Int-System/Home-Water`) เจ้าของอัปไฟล์เอง ผมยังไม่ได้รับสิทธิ์ push และเครื่องแชตเปิดเว็บนี้ไม่ได้ถ้าไม่เพิ่ม `int-system.github.io` ใน Network access |
| Mockup เมนูใหม่ (A/B/C) | https://claude.ai/artifact/YUna5xkorCDSHVkSnxH2n5 (เลือกแบบ A ใช้จริงแล้ว) |

ไฟล์ `data/*.json` (~246 MiB) **ไม่ได้อยู่ใน zip นี้** อยู่บน artifact และ GitHub ถ้าต้องใช้ไฟล์ไหน ดึงจาก artifact ทีละไฟล์ (`Artifact read` + `path: data/<ชื่อ>.json`)

## ลิมิตที่ต้องระวัง

- Artifact: ต่อ 1 version ไม่เกิน **511 ไฟล์** และ **256 MiB** ตอนนี้ใช้ 493 ไฟล์ ~246 MiB เหลือที่น้อย
  - ส่งไฟล์ต่อครั้งไม่เกิน 255 ไฟล์ / 64 MB ต้องแบ่งรอบ
  - ถ้าแทนไฟล์ใหญ่ด้วยไฟล์เล็ก ให้ส่งไฟล์ที่ทำให้ขนาดรวมลดลงก่อน (เคยโดนปฏิเสธเพราะส่งไฟล์ใหม่ก่อนแล้วรวมเกิน 256 MiB)
  - ไฟล์ที่ขึ้นไว้จากแชตก่อน ต้อง `Artifact list scope:files` ก่อน ระบบถึงยอมให้เขียนทับ
- GitHub (อัปผ่านหน้าเว็บ): ครั้งละไม่เกิน 100 ไฟล์ ไฟล์ละไม่เกิน 25 MB และชุดใหญ่ ~58 MB เคยอัปไม่ผ่าน ให้แบ่งชุดละ ~20 MB / ไม่เกิน 90 ไฟล์ ใส่ไว้ใน zip เดียวแยกโฟลเดอร์ `ชุดNN/data/`

## วิธีเริ่มในแชตใหม่

1. อัป zip นี้ แล้วแตกในโฟลเดอร์งาน
2. ต้นฉบับที่แก้คือ **`light/page.html`** (ไฟล์เดียวกับที่ขึ้น artifact)
3. ทุกครั้งที่แก้ `light/page.html`:
   - `cp light/page.html flood-house.lite.html` (สคริปต์ทดสอบและเรนเดอร์อ่านไฟล์นี้)
   - `python3 tools/mkindex.py light` สร้าง `light/index.html` สำหรับ GitHub
4. Playwright + Chromium มีในเครื่องอยู่แล้ว three.js r128 อยู่ใน `deps/node_modules/three` (มีเฉพาะไฟล์ที่ใช้ รวม EffectComposer, SSAO, Bloom)
5. แก้หน้าเว็บด้วยสคริปต์ Python แบบ "หาข้อความเดิมแล้วแทน" (`assert s.count(a)==1`) แล้วเก็บสคริปต์ไว้ ทำซ้ำได้

## โครงสร้างโค้ดใน page.html

- `MODEL`: `'house'` บ้านหลักจอดรถบนคาน (ตัวเลือก A/B/C, ทางรถซ้าย/ขวา, สูง 3.0–4.5) หรือ `'shelter'`
- `SF[...]`: สเปกแบบบ้าน
  - บ้านพักชั่วคราว 9 รูปทรง: `gable hip twin lshape butterfly aframe barrel split wrap`
  - บ้านอยู่ถาวร (`big:1`): `big1 big2` (12×10), `b105 b135` (`gen:1`), `custom` (สร้างจาก `cusSpec()`)
- ตัวแปรสถานะ: `SFORM BROOF SPOS SCAN SSTAIR SEASY H CUS LAND`
- คลาสบน `<html>`: `m-shelter` `m-big` `m-custom` ใช้ซ่อน/แสดงด้วย `.house-only .shelter-only .big-only .no-big .custom-only`
- ฟังก์ชันหลัก: `selectModel selectSForm selectBRoof selectSPos selectSOpt selectHeight` · 3D: `shelterify()` · 2D: `drawShelterPlan drawShelterElev drawShelterCols drawShelterMEP` · งบ: `shelterBOQ refreshCosts` · เอกสาร: `makeDoc docClick`
- ออกแบบเอง: `cusSpec cusBuild cusApply cusMini cusVariants` · ที่ดิน: `landNeed landRect landMax landUI`
- ลิงก์ (hash): `#shelter-<form>-r<roof>-p<pos>-nc-ns-ss-h<สูง×10>` + `-cw -cd -cb -ct -cs -cl -co -ck -cp -cm -cv` + `-lw -ld -lf -ls -lb` · บ้านหลัก `#cars-<3|4|5>-h<สูง>-r`
- ตอนโหลดหน้า `window.__fhBoot=1` ระหว่างอ่าน hash (กันโหลดภาพบ้านหลักทิ้ง) แล้วตั้งเป็น 0 ก่อน `showStill()`

### ภาพสวย (ฉบับ 44) เฉพาะบ้านพัก/บ้านอยู่ถาวร
- โค้ดอยู่ก่อน `function init3D(){`: `PRETTY`, `fhDraw()` (แทน `renderer.render`), `prettyApply` (ท้องฟ้า + env map), `prettySet` (ผิววัสดุผ่าน `onBeforeCompile`), `prettyVeg` (ต้นไม้), `prettyFx` (SSAO ครึ่งความละเอียด + bloom + ACES) โหลดไลบรารีจาก jsDelivr ตอนใช้
- fx เปิดเฉพาะเครื่องแรง (`__FH_HQ` หรือจอคอม ≥4 คอร์ กว้าง >820) มือถือได้ภาพสวยแต่ไม่มี fx
- `prettyMode(s,on)` คืนค่าทั้งหมดเมื่อ `MODEL!=='shelter'` บ้านหลักยังเป็นภาพแบบเดิม
- มุม `street` (มองจากถนน) มีเฉพาะบ้านพัก/บ้านอยู่ถาวร
- ข้อควรระวัง: ชื่อ varying/ฟังก์ชันใน shader ห้ามชนกับ patch เดิม (`vWP h21 vn fbm`) ShaderMaterial ของท้องฟ้าต้องเรียก `linearToOutputTexel` ไม่งั้นทั้งฉากดำ

### เมนูปรับแบบ (ฉบับ 45)
- `<section class="card menu45">` ทุกขั้นเป็น `<details class="m45" data-m45="...">` ปุ่มข้างในคือปุ่มเดิมทุกตัว (id/data-* เดิม) แค่ย้ายเข้ามา
- ลำดับเลขขั้นใช้ CSS counter ขั้นที่ซ่อน (display:none) ไม่นับ
- ค่าที่แสดงในแต่ละแถว อัปเดตด้วย MutationObserver ที่ดู `aria-pressed` (สคริปต์ท้ายหน้า "ฉบับ 45: step menu")
- เปิดทีละขั้น จำขั้นล่าสุดใน localStorage `fh-m45` บนมือถือปิดหมดตอนโหลด ถ้าเป็นออกแบบเอง เปิดขั้น "ขนาดและผังห้อง" ให้เอง
- มือถือ (≤720px): `.main` และ `#p-overview` เป็น `display:contents` แล้วใช้ `order` ให้ภาพขึ้นก่อนเมนู
- สคริปต์ทดสอบที่ต้องกดในขั้นที่ปิดอยู่ ใส่ `await p.addInitScript(()=>{window.__m45all=1})` จะเปิดทุกขั้นค้างไว้

## ไฟล์ข้อมูลภาพนิ่ง (ฉบับ 46)

- `data/<คีย์>.json` = ภาพกลางวันของ 1 แบบ: `{ "<คีย์>-<มุม>": {img, hm} }` มุม `iso front ramp under top` (+ `street` สำหรับบ้านพัก) ~0.2 MB
- `data/n-000.json … n-119.json` = แดดเย็น/กลางคืนของ 3 แบบติดกัน: `{ "<คีย์>-<มุม>": {eve, non, noff} }` ~1.4 MB
- `window.FH_NGRP` ใน page.html บอกว่าแบบไหนอยู่ไฟล์ n ไหน
- ตัวโหลด: `updateStill()` โหลดไฟล์กลางวันก่อน กดแดดเย็น/กลางคืนจึงโหลดไฟล์ n (`fhMerge` รวมข้อมูลตามคีย์มุม, `stillWait` ทำภาพจางระหว่างโหลด)
- `data/drive-*.json` คลิปรถขึ้นจอดบ้านหลัก (ไม่เปลี่ยน)
- คีย์ `SKEY()`: เช่น `S-b105-rshed-psr-h30` บ้านหลัก `A-h40`, `Ar-h35`

## เรนเดอร์ภาพนิ่งชุดใหม่

```
node stillsSF.js <form> <nc 0/1> <ns 0/1> <ss 0/1> <roof> [pos]
```
เขียนลง `stills3/ stillsE/ stillsN/` และ `stills3/tags-<คีย์>.json` ราว 1.7 ชุด/นาทีถ้ารัน 3 ตัวพร้อมกัน จากนั้น:
```
python3 tools/packchunk.py light . <คีย์> [<คีย์> ...]
```
- เขียน `light/data/<คีย์>.json` (กลางวัน) และอัปเดตไฟล์ n ของแบบนั้น + ตำแหน่งป้ายใน `light/page.html`
- **แบบที่มีอยู่แล้ว ต้องมีไฟล์ n ของมันใน `light/data/` ก่อน** (สคริปต์จะบอกชื่อไฟล์ ดึงด้วย `Artifact read path data/n-XXX.json`)
- แบบใหม่จะได้ไฟล์ n ใหม่ (`n-120` ขึ้นไป) ระวังลิมิต 511 ไฟล์ของ artifact (เหลือราว 18 ไฟล์)
- ทดสอบแล้ว: แพ็กแบบเดิมซ้ำได้ไฟล์ตรงกับที่ขึ้นเว็บทุกไบต์
- `tools/split-all.py` ใช้เฉพาะตอนต้องสร้าง data ทั้งหมดใหม่จากไฟล์แบบรวม (รูปแบบเก่า)

## ทดสอบ (เปิดเว็บที่ `light/` ด้วย `cd light && python3 -m http.server 8771` ก่อน)

- `sf/lightF3.js` ทดสอบทั้งเว็บ 522 แบบ ทั้งจอคอมและมือถือ (~20 นาที ต้องได้ `ISSUES 0`) ต้องมี `light/data/` ครบ
- `sf/lgen.js` (96), `sf/lpos.js` (72) ภาพนิ่งบ้านอยู่ถาวร · `sf/tswl.js` สลับแบบ/ความสูง
- `gen/drag.js gen/dnd.js gen/cycle.js gen/land.js gen/cus.js` ออกแบบเอง ลากห้อง ลากผนัง ที่ดิน (อ่าน `flood-house.lite.html`)
- `gen/t46.js` ดูว่าเปลี่ยนแบบ/กดแดดเย็น/กลางคืน โหลดไฟล์ไหนบ้าง
- `sf/tdoc.js <hash>` สร้างเอกสารช่างเป็น PDF ไว้ตรวจ

## ขึ้นเว็บ

- Artifact: publish `light/page.html` ใส่ `url` ของเว็บหลัก + `root: light` + `files` เฉพาะไฟล์ data ที่เปลี่ยน (ไฟล์เดิมไม่ต้องส่งซ้ำ)
- GitHub: zip `index.html` + ไฟล์ data ที่เปลี่ยน แบ่งชุดตามลิมิตด้านบน ให้เจ้าของแตกแล้วอัปเอง

## งานที่เสนอไว้ ยังไม่ได้ทำ

- ปุ่ม "ช่วยเลือกแบบให้" (ถามจำนวนคน ระดับน้ำ ขนาดที่ดิน แล้วแนะนำแบบ)
- QR code ของแบบที่เลือก บนหน้าเว็บและในเอกสารช่าง
- เทียบ 2 แบบข้างกัน
- บ้านหลักใช้ภาพแบบใหม่ (ต้องเรนเดอร์ใหม่หลายชั่วโมง และเพิ่มไฟล์ อาจชนลิมิต 256 MiB ของ artifact)

## ข้อตกลงกับเจ้าของงาน

- คุยภาษาไทย ทำ mockup ให้ดูก่อนถ้าเป็นฟีเจอร์ใหญ่ ส่งไฟล์ zip ให้อัป GitHub ทุกครั้งที่ขึ้นฉบับใหม่
- ห้าม push GitHub เองจนกว่าเจ้าของอนุญาตชัดเจน
- งบและราคาซ่อนหลังรหัสปลดล็อก (เก็บแบบ hash ในหน้าเว็บ สคริปต์ทดสอบมีรหัสอยู่)

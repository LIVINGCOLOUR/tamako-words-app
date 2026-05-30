(function () {
  const MAX_EDGE = 512;
  const JPEG_QUALITY = 0.75;
  const MAX_DATA_URL_LENGTH = 1200000;

  function normalize(input){
    if(window.TamakoState&&window.TamakoState.normalizeSupportStamp)return window.TamakoState.normalizeSupportStamp(input);
    const prev=input&&typeof input==="object"?input:{};
    const rawPhoto=typeof prev.photoDataUrl==="string"?prev.photoDataUrl.trim():"";const photo=rawPhoto.indexOf("data:image/")===0?rawPhoto:"";const updatedAt=typeof prev.updatedAt==="string"?prev.updatedAt:"";return{version:1,photoDataUrl:photo,updatedAt};
  }
  function empty(){return{version:1,photoDataUrl:"",updatedAt:new Date().toISOString()};}
  function hasPhoto(state){const stamp=normalize(state&&state.supportStamp);return stamp.photoDataUrl!=="";}
  function fileToDataUrl(file){return new Promise((resolve,reject)=>{if(!file||!file.type||file.type.indexOf("image/")!==0){reject(new Error("image only"));return;}const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||""));reader.onerror=()=>reject(new Error("read failed"));reader.readAsDataURL(file);});}
  function loadImage(dataUrl){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error("image load failed"));img.src=dataUrl;});}
  function resizeImage(img){const width=img.naturalWidth||img.width;const height=img.naturalHeight||img.height;if(!width||!height)throw new Error("image size failed");const scale=Math.min(1,MAX_EDGE/width,MAX_EDGE/height);const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));const ctx=canvas.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);const dataUrl=canvas.toDataURL("image/jpeg",JPEG_QUALITY);if(dataUrl.length>MAX_DATA_URL_LENGTH)throw new Error("image too large");return dataUrl;}
  async function fromFile(file){const raw=await fileToDataUrl(file);const img=await loadImage(raw);return{version:1,photoDataUrl:resizeImage(img),updatedAt:new Date().toISOString()};}
  function createStampElement(state,options){const stamp=normalize(state&&state.supportStamp);if(!stamp.photoDataUrl)return null;const opts=options||{};const special=!!opts.special;const root=document.createElement("div");root.className="supportStamp"+(special?" supportStampSpecial":"")+(opts.compact?" supportStampCompact":"")+(opts.preview?" supportStampPreviewStamp":"");root.setAttribute("role","img");root.setAttribute("aria-label",special?"とくべつおうえんスタンプ":"おうえんスタンプ");if(special){const sparkle=document.createElement("div");sparkle.className="supportSparkle";sparkle.textContent="きらきら";root.appendChild(sparkle);}const photo=document.createElement("img");photo.className="supportPhoto";photo.src=stamp.photoDataUrl;photo.alt="";const bubble=document.createElement("div");bubble.className="supportBubble";bubble.textContent=special?"レベルアップ！すごい！":"できたね！";root.appendChild(photo);root.appendChild(bubble);return root;}
  function renderInto(container,state,options){if(!container)return"";const opts=options||{};container.innerHTML="";const custom=createStampElement(state,opts);if(custom){container.appendChild(custom);return"support";}if(opts.fallbackSrc){const img=document.createElement("img");if(opts.fallbackId)img.id=opts.fallbackId;img.className=opts.fallbackClass||"stickerResult";img.src=opts.fallbackSrc;img.alt=opts.fallbackAlt||"シール";container.appendChild(img);return"default";}return"";}
  window.TamakoSupportStamps=Object.freeze({MAX_EDGE,JPEG_QUALITY,normalize,empty,hasPhoto,fromFile,createStampElement,renderInto});
})();


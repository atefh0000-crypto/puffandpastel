const BASE_PRODUCTS = Array.isArray(PRODUCTS) ? PRODUCTS : [];
const CUSTOM_KEY = "puff_custom_products_v1";
const ORDERS_KEY = "puff_orders_v1";
let customProducts = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
if(!Array.isArray(customProducts)) customProducts=[];

const $ = id => document.getElementById(id);
let selectedImage = "";

function allProducts(){ return [...BASE_PRODUCTS, ...customProducts]; }
function money(n){ return Number(n).toFixed(3)+" DT"; }
function esc(v){ return String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }
function saveCustom(){ localStorage.setItem(CUSTOM_KEY,JSON.stringify(customProducts)); }
function updateStats(){
  $("productCount").textContent=allProducts().length;
  $("customCount").textContent=customProducts.length;
  let orders=[]; try{orders=JSON.parse(localStorage.getItem(ORDERS_KEY)||"[]")}catch(e){}
  $("orderCount").textContent=Array.isArray(orders)?orders.length:0;
}
function renderProducts(){
  const list=allProducts();
  if(!list.length){$("productTableWrap").innerHTML='<div class="empty">No products yet.</div>';return;}
  $("productTableWrap").innerHTML=`<table class="admin-table"><thead><tr><th>Photo</th><th>Product</th><th>Category</th><th>Price</th><th>Type</th><th>Actions</th></tr></thead><tbody>${list.map(p=>{
    const custom=customProducts.some(x=>Number(x.id)===Number(p.id));
    return `<tr><td>${p.image?`<img class="admin-product-img" src="${p.image}" alt="${esc(p.name)}">`:`<div class="admin-product-img" style="display:grid;place-items:center">${p.emoji||"♡"}</div>`}</td><td><strong>${esc(p.name)}</strong><br><small>${esc(p.description||"").slice(0,80)}</small></td><td>${esc(p.category)}</td><td>${money(p.price)}</td><td><span class="pill">${custom?"Custom":"Default"}</span></td><td>${custom?`<button class="admin-btn edit" onclick="editProduct(${p.id})">Edit</button><button class="admin-btn danger" onclick="deleteProduct(${p.id})">Delete</button>`:`<span style="color:#999;font-size:12px">Default product</span>`}</td></tr>`;
  }).join("")}</tbody></table>`;
}
function renderOrders(){
  let orders=[];try{orders=JSON.parse(localStorage.getItem(ORDERS_KEY)||"[]")}catch(e){}
  if(!orders.length){$("ordersWrap").innerHTML='<div class="empty">No orders saved on this browser yet.</div>';return;}
  $("ordersWrap").innerHTML=`<table class="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Phone</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>${orders.slice(0,30).map(o=>`<tr><td><strong>${esc(o.id)}</strong></td><td>${esc(o.customer)}</td><td>${esc(o.phone)}</td><td>${esc((o.items||[]).join(" | "))}</td><td>${esc(o.total)}</td><td><span class="pill">${esc(o.status||"New")}</span></td><td>${esc(o.date)}</td></tr>`).join("")}</tbody></table>`;
}
function resetForm(){
  $("productForm").reset(); $("editId").value=""; $("pBg").value="#f8e8f0"; $("pEmoji").value="🎀"; $("existingImage").value=""; selectedImage=""; $("imagePreview").src=""; $("imagePreview").style.display="none"; $("formTitle").textContent="Add a new product ✨"; $("saveProductBtn").textContent="＋ Add product"; $("cancelEdit").classList.add("hidden");
}
function compressImage(file){
  return new Promise((resolve,reject)=>{
    if(!file)return resolve("");
    const reader=new FileReader();
    reader.onload=()=>{const img=new Image();img.onload=()=>{const max=1200;const scale=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement("canvas");c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));const ctx=c.getContext("2d");ctx.drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL("image/jpeg",0.82));};img.onerror=reject;img.src=reader.result;};reader.onerror=reject;reader.readAsDataURL(file);
  });
}
$("pImage").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{selectedImage=await compressImage(file);$("imagePreview").src=selectedImage;$("imagePreview").style.display="block";}catch(err){alert("Could not read this image.");}});
$("productForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const editId=Number($("editId").value||0);
  const product={id:editId||Date.now(),name:$("pName").value.trim(),price:Number($("pPrice").value),category:$("pCategory").value,badge:$("pBadge").value.trim(),emoji:$("pEmoji").value.trim()||"🎀",bg:$("pBg").value,description:$("pDescription").value.trim(),image:selectedImage||$("existingImage").value||""};
  if(!product.name || !Number.isFinite(product.price)){alert("Please enter a product name and valid price.");return;}
  if(editId){const idx=customProducts.findIndex(x=>Number(x.id)===editId);if(idx>=0)customProducts[idx]=product;else customProducts.push(product);}else customProducts.unshift(product);
  saveCustom();resetForm();renderProducts();updateStats();alert(editId?"Product updated ♡":"Product added to the store ♡");
});
window.editProduct=id=>{const p=customProducts.find(x=>Number(x.id)===Number(id));if(!p)return;$("editId").value=p.id;$("pName").value=p.name;$("pPrice").value=p.price;$("pCategory").value=p.category;$("pBadge").value=p.badge||"";$("pEmoji").value=p.emoji||"🎀";$("pBg").value=p.bg||"#f8e8f0";$("pDescription").value=p.description||"";$("existingImage").value=p.image||"";selectedImage="";if(p.image){$("imagePreview").src=p.image;$("imagePreview").style.display="block";}$("formTitle").textContent="Edit product ✏️";$("saveProductBtn").textContent="Save changes";$("cancelEdit").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});};
window.deleteProduct=id=>{const p=customProducts.find(x=>Number(x.id)===Number(id));if(!p)return;if(!confirm(`Delete ${p.name}?`))return;customProducts=customProducts.filter(x=>Number(x.id)!==Number(id));saveCustom();renderProducts();updateStats();};
$("cancelEdit").onclick=resetForm;
$("clearForm").onclick=resetForm;
$("exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(customProducts,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="puff-and-pastel-products.json";a.click();URL.revokeObjectURL(a.href);};
$("importInput").onchange=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result);if(!Array.isArray(data))throw Error();customProducts=data;saveCustom();renderProducts();updateStats();alert("Products imported ♡");}catch(err){alert("Invalid product JSON file.");}};r.readAsText(file);};

renderProducts();renderOrders();updateStats();

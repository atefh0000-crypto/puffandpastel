// Puff & Pastel storefront
const BASE_PRODUCTS = Array.isArray(PRODUCTS) ? PRODUCTS : [];
const CUSTOM_PRODUCTS_KEY = "puff_custom_products_v1";
const ORDERS_KEY = "puff_orders_v1";

function loadProducts(){
  try {
    const custom = JSON.parse(localStorage.getItem(CUSTOM_PRODUCTS_KEY) || "[]");
    return [...BASE_PRODUCTS, ...(Array.isArray(custom) ? custom : [])];
  } catch(e){ return [...BASE_PRODUCTS]; }
}
let products = loadProducts();
let cart = JSON.parse(localStorage.getItem("puff_cart") || "[]");
let activeFilter = "All";

const grid = document.getElementById("productGrid");
const count = document.getElementById("cartCount");
const drawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const toast = document.getElementById("toast");

function money(n){ return Number(n).toFixed(3) + " DT"; }
function getProduct(id){ return products.find(p => Number(p.id) === Number(id)); }
function esc(value){ return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c])); }

function renderProducts(list=products){
  grid.innerHTML = list.map(p => `
    <article class="product-card" onclick="openProduct(${p.id})">
      <div class="product-art" style="background:${esc(p.bg || "#f8e8f0")}">
        ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
        ${p.image ? `<img src="${p.image}" alt="${esc(p.name)}">` : `<span>${p.emoji || "♡"}</span>`}
      </div>
      <div class="product-info">
        <span class="cat">${esc(p.category || "Accessories").toUpperCase()}</span>
        <h3>${esc(p.name)}</h3>
        <div class="price-row">
          <span class="price">${money(p.price)}</span>
          <button class="add-btn" onclick="event.stopPropagation();addToCart(${p.id})">+</button>
        </div>
      </div>
    </article>`).join("");
}

function openProduct(id){
  const p = getProduct(id); if(!p) return;
  const modal = document.getElementById("productModal");
  modal.innerHTML = `<div class="product-modal-box">
    <button class="product-close" onclick="closeProduct()">×</button>
    <div class="modal-product-art" style="background:${esc(p.bg || "#f8e8f0")}">
      ${p.image ? `<img src="${p.image}" alt="${esc(p.name)}">` : `<span>${p.emoji || "♡"}</span>`}
    </div>
    <div class="modal-product-copy">
      <span class="eyebrow">${esc(p.category || "Accessories").toUpperCase()}</span>
      <h2>${esc(p.name)}</h2>
      <div class="modal-price">${money(p.price)}</div>
      <p>${esc(p.description || "Cute product from Puff & Pastel ♡")}</p>
      <button class="primary-btn full" onclick="addToCart(${p.id});closeProduct()">Add to cute bag ♡</button>
    </div>
  </div>`;
  modal.classList.add("open");
}
function closeProduct(){ document.getElementById("productModal").classList.remove("open"); }
function addToCart(id){
  const item = cart.find(x => Number(x.id) === Number(id));
  if(item) item.qty++; else cart.push({id:Number(id),qty:1});
  saveCart(); toast.textContent="Added to your cute bag ♡"; showToast();
}
function saveCart(){ localStorage.setItem("puff_cart",JSON.stringify(cart)); renderCart(); }
function renderCart(){
  let total=0;
  document.getElementById("cartItems").innerHTML = cart.map(i=>{
    const p=getProduct(i.id); if(!p) return "";
    const subtotal=Number(p.price)*i.qty; total+=subtotal;
    return `<div class="cart-item">
      <div class="cart-item-art" style="background:${esc(p.bg || "#f8e8f0")}">${p.image ? `<img src="${p.image}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">` : (p.emoji||"♡")}</div>
      <div><h4>${esc(p.name)}</h4><div class="qty"><button onclick="changeQty(${p.id},-1)">−</button><span>${i.qty}</span><button onclick="changeQty(${p.id},1)">+</button></div></div>
      <strong>${money(subtotal)}</strong>
    </div>`;
  }).join("");
  document.getElementById("cartEmpty").style.display=cart.length?"none":"block";
  document.getElementById("cartTotal").textContent=money(total);
  count.textContent=cart.reduce((a,b)=>a+b.qty,0);
}
function changeQty(id,d){ const x=cart.find(i=>Number(i.id)===Number(id)); if(!x)return; x.qty+=d; if(x.qty<=0)cart=cart.filter(i=>Number(i.id)!==Number(id)); saveCart(); }
function showToast(){ toast.classList.add("show"); setTimeout(()=>toast.classList.remove("show"),1700); }
function openCart(){ drawer.classList.add("open"); overlay.classList.add("show"); }
function closeCart(){ drawer.classList.remove("open"); overlay.classList.remove("show"); }

document.getElementById("cartBtn").onclick=openCart;
document.getElementById("closeCart").onclick=closeCart;
overlay.onclick=closeCart;

document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active")); b.classList.add("active");
  activeFilter=b.dataset.filter;
  renderProducts(activeFilter==="All"?products:products.filter(p=>p.category===activeFilter));
});
document.querySelectorAll(".collection").forEach(b=>b.onclick=()=>{ const f=document.querySelector(`[data-filter="${b.dataset.category}"]`); if(f)f.click(); document.getElementById("shop").scrollIntoView({behavior:"smooth"}); });

const searchPanel=document.getElementById("searchPanel");
document.getElementById("searchBtn").onclick=()=>searchPanel.classList.add("open");
document.getElementById("closeSearch").onclick=()=>searchPanel.classList.remove("open");
document.getElementById("searchInput").oninput=e=>{ const q=e.target.value.toLowerCase().trim(); renderProducts(products.filter(p=>(p.name+" "+p.category+" "+(p.description||"")).toLowerCase().includes(q))); };
document.getElementById("newsletterForm").onsubmit=e=>{e.preventDefault();e.target.reset();toast.textContent="You're on the cute list ♡";showToast();};

// Email order
const STORE_EMAIL="puffsandpastel@gmail.com";
const checkoutModal=document.getElementById("checkoutModal");
const checkoutForm=document.getElementById("checkoutForm");
document.getElementById("checkoutBtn").onclick=()=>{if(!cart.length){toast.textContent="Your bag is empty ♡";showToast();return}checkoutModal.classList.add("open")};
document.getElementById("checkoutClose").onclick=()=>checkoutModal.classList.remove("open");
checkoutModal.onclick=e=>{if(e.target===checkoutModal)checkoutModal.classList.remove("open")};

checkoutForm.onsubmit=async e=>{
  e.preventDefault(); if(!cart.length)return;
  const name=document.getElementById("customerName").value.trim();
  const phone=document.getElementById("customerPhone").value.trim();
  const governorate=document.getElementById("customerGovernorate").value;
  const address=document.getElementById("customerAddress").value.trim();
  let total=0;
  const lines=cart.map(i=>{const p=getProduct(i.id);if(!p)return "";const s=Number(p.price)*i.qty;total+=s;return `${p.name} x ${i.qty} — ${money(s)}`;});
  const orderId="PP-"+Date.now().toString().slice(-8);
  const date=new Date().toLocaleString();
  const order={id:orderId,customer:name,phone,governorate,address,items:lines,total:money(total),status:"New",date};
  try { const old=JSON.parse(localStorage.getItem(ORDERS_KEY)||"[]"); old.unshift(order); localStorage.setItem(ORDERS_KEY,JSON.stringify(old)); } catch(e){}
  const payload={_subject:`Puff & Pastel — New Order ${orderId}`,_template:"table",order:orderId,customer:name,phone,governorate,address,products:lines.join("\n"),total:money(total),date};
  try{
    const r=await fetch("https://formsubmit.co/ajax/"+encodeURIComponent(STORE_EMAIL),{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(payload)});
    if(!r.ok)throw Error();
    cart=[];saveCart();checkoutForm.reset();checkoutModal.classList.remove("open");toast.textContent="Order sent successfully ♡";showToast();
  }catch(err){
    const body=`New Puff & Pastel order\n\nOrder: ${orderId}\nCustomer: ${name}\nPhone: ${phone}\nGovernorate: ${governorate}\nAddress: ${address}\n\nProducts:\n${lines.join("\n")}\n\nTOTAL: ${money(total)}\nDate: ${date}`;
    location.href=`mailto:${STORE_EMAIL}?subject=${encodeURIComponent("Puff & Pastel — New Order "+orderId)}&body=${encodeURIComponent(body)}`;
  }
};

renderProducts();
renderCart();

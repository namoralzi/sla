const INPUT = document.querySelector('#texto');
const LISTA = document.querySelector('#lista');
const BTN_ADD = document.querySelector('#addBtn');
const BTN_SHARE = document.querySelector('#btnShare');
const BTN_INSTALL = document.querySelector('#btnInstall');
const BTN_LIMPAR = document.querySelector('#btnLimpar');
const TOAST = document.querySelector('#toast');

let itens = JSON.parse(localStorage.getItem('itens_compra') || '[]');
let deferredPrompt = null;

function salvar(){
  localStorage.setItem('itens_compra', JSON.stringify(itens));
}

function toast(msg='Pronto ✅'){
  TOAST.textContent = msg;
  TOAST.classList.add('show');
  setTimeout(()=>TOAST.classList.remove('show'), 1600);
}

function desenhar(){
  LISTA.innerHTML = '';
  itens.forEach((it, idx)=>{
    const row = document.createElement('div');
    row.className = 'item';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!it.done;
    cb.addEventListener('change', ()=>{
      itens[idx].done = cb.checked;
      salvar();
      desenhar();
    });

    const nome = document.createElement('div');
    nome.className = 'name' + (it.done ? ' done' : '');
    nome.textContent = it.nome;

    const btnDel = document.createElement('button');
    btnDel.textContent = 'Remover';
    btnDel.className = 'btn-danger tiny';
    btnDel.addEventListener('click', ()=>{
      itens.splice(idx,1);
      salvar();
      desenhar();
    });

    row.appendChild(cb);
    row.appendChild(nome);
    row.appendChild(btnDel);
    LISTA.appendChild(row);
  });
}

BTN_ADD.addEventListener('click', ()=>{
  const txt = (INPUT.value || '').trim();
  if(!txt) return INPUT.focus();
  itens.push({nome: txt, done:false});
  INPUT.value = '';
  salvar();
  desenhar();
  toast('Adicionado!');
});

INPUT.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter'){ BTN_ADD.click(); }
});

BTN_SHARE.addEventListener('click', async ()=>{
  const lines = itens.map((i, n)=> `${n+1}. ${i.done ? '✅' : '▫️'} ${i.nome}`);
  const text = `🛒 Minha Lista de Compras\n\n` + (lines.join('\n') || '— vazia —');
  try {
    if(navigator.share){
      await navigator.share({text});
    }else{
      await navigator.clipboard.writeText(text);
      toast('Copiado! Abra o WhatsApp e cole.');
    }
  } catch(e){
    await navigator.clipboard.writeText(text);
    toast('Copiado!');
  }
});

BTN_LIMPAR.addEventListener('click', ()=>{
  itens = itens.filter(i=>!i.done);
  salvar();
  desenhar();
  toast('Concluídos removidos.');
});

// PWA: install prompt
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  BTN_INSTALL.hidden = false;
});
BTN_INSTALL.addEventListener('click', async ()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if(outcome === 'accepted'){
    BTN_INSTALL.hidden = true;
    toast('Instalado 🎉');
  }
  deferredPrompt = null;
});

// PWA: service worker
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('./service-worker.js');
  });
}

desenhar();

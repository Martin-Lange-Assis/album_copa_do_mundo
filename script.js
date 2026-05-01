// 1. Configuração Inicial
const CHAVE_ALBUM = 'album_copa_2026';
const gridFigurinhas = document.getElementById('grid-figurinhas');

// Capturando os elementos do Dropdown
const btnSeletor = document.getElementById('btn-seletor');
const menuSelecoes = document.getElementById('menu-selecoes');

// Carrega o álbum salvo no celular (ou cria um vazio)
let meuAlbum = JSON.parse(localStorage.getItem(CHAVE_ALBUM)) || {};

// 2. A Lógica de Cores e Estilos (Tailwind)
function getEstiloBotao(quantidade) {
    if (quantidade === 0) {
        return 'aspect-square flex flex-col items-center justify-center bg-[#E5E7EB] text-slate-400 rounded-xl border border-slate-300 active:scale-90 transition-all cursor-pointer user-select-none';
    } else if (quantidade === 1) {
        return 'aspect-square flex flex-col items-center justify-center bg-primary-container text-on-primary rounded-xl shadow-md active:scale-90 transition-all border-2 border-primary/20 relative cursor-pointer user-select-none';
    } else {
        return 'aspect-square flex flex-col items-center justify-center bg-secondary-container text-white rounded-xl shadow-md active:scale-90 transition-all border-2 border-secondary/20 relative overflow-visible cursor-pointer user-select-none';
    }
}

// 3. Renderizar a Grade Dinamicamente
function renderizarSelecao(sigla, totalFigurinhas) {
    // Busca os dados da seleção na lista global (do selecoes.js)
    const dadosSelecao = LISTA_SELECOES.find(s => s.sigla === sigla);

    // Atualiza a interface (Topo: Título e IMAGEM SVG)
    if (dadosSelecao) {
        document.getElementById('nome-selecao').innerText = dadosSelecao.nome;
        // Puxa o SVG correspondente à sigla da seleção
        document.getElementById('bandeira-topo').src = `./bandeiras/${dadosSelecao.sigla}.svg`;
    }

    // Calcula o progresso desta seleção específica
    let coladas = 0;
    let repetidasTotal = 0;

    for (let i = 1; i <= totalFigurinhas; i++) {
        let qtd = meuAlbum[`${sigla}${i}`] || 0;
        if (qtd > 0) coladas++;
        if (qtd > 1) repetidasTotal += (qtd - 1);
    }

    // Atualiza os textos e barra de progresso no HTML
    const textoProgresso = document.querySelector('.font-sticker-num.text-primary');
    if (textoProgresso) textoProgresso.innerText = `${coladas}/${totalFigurinhas}`;

    const barraProgresso = document.querySelector('.bg-primary-container.rounded-full');
    if (barraProgresso) {
        const porcentagem = (coladas / totalFigurinhas) * 100;
        barraProgresso.style.width = `${porcentagem}%`;
    }

    const textoQtdColadas = document.getElementById('qtd-coladas');
    if (textoQtdColadas) textoQtdColadas.innerText = `${coladas} Colecionadas`;

    const textoQtdRepetidas = document.getElementById('qtd-repetidas');
    if (textoQtdRepetidas) textoQtdRepetidas.innerText = `${repetidasTotal} Repetidas`;

    // Renderiza o Grid de Figurinhas
    gridFigurinhas.innerHTML = '';

    for (let i = 1; i <= totalFigurinhas; i++) {
        let codigo = `${sigla}${i}`;
        let qtd = meuAlbum[codigo] || 0;

        let botao = document.createElement('button');
        botao.className = getEstiloBotao(qtd);
        botao.oncontextmenu = (e) => e.preventDefault();

        let conteudoHTML = `<span class="font-sticker-num">${sigla} ${i}</span>`;

        if (qtd > 1) {
            let repetidas = qtd - 1;
            conteudoHTML += `<div class="absolute -top-1.5 -right-1.5 bg-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">+${repetidas}</div>`;
        }

        botao.innerHTML = conteudoHTML;

        // Lógica de Clique e Long Press (Remover figurinha)
        let pressTimer;
        let isLongPress = false;

        const startPress = (e) => {
            isLongPress = false;
            pressTimer = setTimeout(() => {
                isLongPress = true;
                let atual = meuAlbum[codigo] || 0;
                if (atual > 0) {
                    meuAlbum[codigo] = atual - 1;
                    localStorage.setItem(CHAVE_ALBUM, JSON.stringify(meuAlbum));
                    if (navigator.vibrate) navigator.vibrate(50);
                    renderizarSelecao(sigla, totalFigurinhas); // Re-renderiza atualizado
                }
            }, 500);
        };

        const cancelPress = () => clearTimeout(pressTimer);

        botao.addEventListener('touchstart', startPress, { passive: true });
        botao.addEventListener('touchend', cancelPress);
        botao.addEventListener('touchmove', cancelPress);
        botao.addEventListener('mousedown', startPress);
        botao.addEventListener('mouseup', cancelPress);
        botao.addEventListener('mouseleave', cancelPress);

        // Adicionar figurinha
        botao.onclick = (e) => {
            if (isLongPress) return;
            let atual = meuAlbum[codigo] || 0;
            meuAlbum[codigo] = atual + 1;
            localStorage.setItem(CHAVE_ALBUM, JSON.stringify(meuAlbum));
            renderizarSelecao(sigla, totalFigurinhas);
        };

        gridFigurinhas.appendChild(botao);
    }
}

// --- LÓGICA DO MENU DROPDOWN ---

// Abrir/Fechar o menu ao clicar no botão principal
btnSeletor.addEventListener('click', () => {
    menuSelecoes.classList.toggle('hidden');
});

// Fechar o menu automaticamente se clicar fora dele
document.addEventListener('click', (event) => {
    if (!btnSeletor.contains(event.target) && !menuSelecoes.contains(event.target)) {
        menuSelecoes.classList.add('hidden');
    }
});

// Montar a lista de seleções puxando as imagens SVG
function inicializarDropdown() {
    menuSelecoes.innerHTML = '';

    LISTA_SELECOES.forEach(selecao => {
        const item = document.createElement('button');
        item.className = 'w-full flex items-center gap-3 p-3 hover:bg-surface-container-low transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 text-left';

        // Injeta a tag img apontando para o arquivo .svg na sua pasta
        item.innerHTML = `
            <div class="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0">
                <img src="./bandeiras/${selecao.sigla}.svg" class="w-full h-full object-cover" onerror="this.style.display='none'" />
            </div>
            <span class="font-body-lg text-on-surface font-medium">${selecao.nome}</span>
        `;

        // O que acontece ao clicar em um país da lista
        item.onclick = () => {
            renderizarSelecao(selecao.sigla, selecao.total);
            menuSelecoes.classList.add('hidden'); // Esconde o menu após a escolha
        };

        menuSelecoes.appendChild(item);
    });
}

// --- INICIALIZAÇÃO GERAL DO APP ---
inicializarDropdown();

// Inicia com o Brasil (Que é o índice 1 na sua lista, logo após a Argentina)
const selecaoInicial = LISTA_SELECOES.find(s => s.sigla === 'BRA') || LISTA_SELECOES[0];
renderizarSelecao(selecaoInicial.sigla, selecaoInicial.total);

// Registra o Service Worker para o app funcionar offline e ser instalável
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('PWA: Service Worker registrado com sucesso!', registration.scope);
            })
            .catch((error) => {
                console.error('PWA: Falha ao registrar o Service Worker:', error);
            });
    });
}
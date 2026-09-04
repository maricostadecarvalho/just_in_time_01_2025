let produtos = JSON.parse(localStorage.getItem("produtosMDF")) || [];
let pedidos = JSON.parse(localStorage.getItem("pedidosMDF")) || [];
let producoes = JSON.parse(localStorage.getItem("producoesMDF")) || [];
let historico = JSON.parse(localStorage.getItem("historicoMDF")) || [];

let usuarioAtual = sessionStorage.getItem("usuarioMDF") || "";

function entrar() {
    const usuario = document.getElementById("usuarioLogin").value.trim();
    const senha = document.getElementById("senhaLogin").value.trim();

    if (usuario === "mariana" && senha === "1712") {
        usuarioAtual = usuario;

        sessionStorage.setItem("usuarioMDF", usuarioAtual);

        registrarHistorico("Login realizado no sistema");

        iniciarSistema();
    } else {
        alert("Usuário ou senha incorretos.");
    }
}

function iniciarSistema() {
    document.getElementById("login").classList.add("oculto");
    document.getElementById("sistema").classList.remove("oculto");

    document.getElementById("usuarioLogado").textContent =
        "Usuário: " + usuarioAtual;

    atualizarTudo();
}

function sair() {
    registrarHistorico("Logout realizado no sistema");

    sessionStorage.removeItem("usuarioMDF");

    usuarioAtual = "";

    document.getElementById("sistema").classList.add("oculto");
    document.getElementById("login").classList.remove("oculto");

    document.getElementById("senhaLogin").value = "";
}

function mostrarPagina(id) {
    document.querySelectorAll(".pagina").forEach(pagina => {
        pagina.classList.add("oculto");
    });

    document.getElementById(id).classList.remove("oculto");

    atualizarTudo();
}

function abrirModalProduto() {
    document.getElementById("modalProduto").classList.remove("oculto");
}

function fecharModalProduto() {
    document.getElementById("modalProduto").classList.add("oculto");
}

function salvarProduto() {
    const nome = document.getElementById("nomeProduto").value.trim();
    const descricao = document.getElementById("descricaoProduto").value.trim();
    const custo = Number(document.getElementById("custoProduto").value);
    const estoque = Number(document.getElementById("estoqueProduto").value);
    const minimo = Number(document.getElementById("minimoProduto").value);

    if (!nome || !descricao) {
        alert("Preencha nome e descrição.");
        return;
    }

    if (custo < 0 || estoque < 0 || minimo < 0) {
        alert("Os valores não podem ser negativos.");
        return;
    }

    const produto = {
        id: Date.now(),
        nome,
        descricao,
        custo,
        estoque,
        minimo,
        usuario: usuarioAtual,
        dataCadastro: novaDataHora()
    };

    produtos.push(produto);

    salvarDados();

    registrarHistorico(
        `Produto "${nome}" cadastrado com estoque inicial de ${estoque} unidade(s)`
    );

    document.getElementById("nomeProduto").value = "";
    document.getElementById("descricaoProduto").value = "";
    document.getElementById("custoProduto").value = "";
    document.getElementById("estoqueProduto").value = "";
    document.getElementById("minimoProduto").value = "";

    fecharModalProduto();

    atualizarTudo();
}

function excluirProduto(id) {
    const produto = produtos.find(p => p.id === id);

    if (!produto) {
        return;
    }

    const possuiPedido = pedidos.some(p => p.produtoId === id);
    const possuiProducao = producoes.some(p => p.produtoId === id);

    if (possuiPedido || possuiProducao) {
        alert("Esse produto possui movimentações e não pode ser excluído.");
        return;
    }

    if (!confirm(`Deseja excluir o produto "${produto.nome}"?`)) {
        return;
    }

    produtos = produtos.filter(p => p.id !== id);

    salvarDados();

    registrarHistorico(
        `Produto "${produto.nome}" excluído`
    );

    atualizarTudo();
}

function listarProdutos() {
    const lista = document.getElementById("listaProdutos");

    lista.innerHTML = "";

    if (produtos.length === 0) {
        lista.innerHTML =
            '<div class="sem-registros">Nenhum produto cadastrado.</div>';

        return;
    }

    produtos.forEach(produto => {
        const item = document.createElement("div");

        item.className = "item";

        let aviso = "";

        if (produto.estoque <= produto.minimo) {
            aviso = " ⚠️ Estoque baixo";
        }

        item.innerHTML = `
            <div>
                <h3>${produto.nome}</h3>

                <p>${produto.descricao}</p>

                <p>
                    Estoque mínimo:
                    ${produto.minimo}
                    ${aviso}
                </p>

                <p>
                    Cadastrado por:
                    ${produto.usuario}
                </p>
            </div>

            <div>
                <p>Custo</p>
                <strong>
                    R$ ${produto.custo.toFixed(2)}
                </strong>
            </div>

            <div>
                <p>Estoque</p>
                <strong>
                    ${produto.estoque}
                </strong>

                <div class="acoes">
                    <button
                        class="excluir"
                        onclick="excluirProduto(${produto.id})"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        `;

        lista.appendChild(item);
    });
}

function abrirModalPedido() {
    if (produtos.length === 0) {
        alert("Cadastre um produto primeiro.");
        return;
    }

    atualizarSelects();

    document.getElementById("dataPedido").value = dataHoje();

    document.getElementById("modalPedido").classList.remove("oculto");
}

function fecharModalPedido() {
    document.getElementById("modalPedido").classList.add("oculto");
}

function salvarPedido() {
    const produtoId = Number(
        document.getElementById("produtoPedido").value
    );

    const quantidade = Number(
        document.getElementById("quantidadePedido").value
    );

    const data = document.getElementById("dataPedido").value;

    const produto = produtos.find(
        p => p.id === produtoId
    );

    if (!produto) {
        alert("Produto inválido.");
        return;
    }

    if (!quantidade || quantidade <= 0) {
        alert("Informe uma quantidade válida.");
        return;
    }

    if (!data) {
        alert("Informe a data do pedido.");
        return;
    }

    if (quantidade > produto.estoque) {
        alert(
            `Estoque insuficiente. Atualmente existem ${produto.estoque} unidade(s).`
        );

        return;
    }

    produto.estoque -= quantidade;

    const pedido = {
        id: Date.now(),
        produtoId,
        produto: produto.nome,
        quantidade,
        data,
        usuario: usuarioAtual,
        dataRegistro: novaDataHora()
    };

    pedidos.push(pedido);

    salvarDados();

    registrarHistorico(
        `Pedido registrado: ${quantidade} unidade(s) de "${produto.nome}" saíram do estoque`
    );

    document.getElementById("quantidadePedido").value = "";

    fecharModalPedido();

    atualizarTudo();
}

function listarPedidos() {
    const lista = document.getElementById("listaPedidos");

    lista.innerHTML = "";

    if (pedidos.length === 0) {
        lista.innerHTML =
            '<div class="sem-registros">Nenhum pedido registrado.</div>';

        return;
    }

    [...pedidos].reverse().forEach(pedido => {
        const item = document.createElement("div");

        item.className = "item";

        item.innerHTML = `
            <div>
                <h3>${pedido.produto}</h3>

                <p>
                    Data do pedido:
                    ${formatarData(pedido.data)}
                </p>

                <p>
                    Registrado por:
                    ${pedido.usuario}
                </p>
            </div>

            <div>
                <p>Quantidade</p>
                <strong>
                    ${pedido.quantidade}
                </strong>
            </div>

            <div>
                <span class="status status-producao">
                    Saída
                </span>
            </div>
        `;

        lista.appendChild(item);
    });
}

function abrirModalProducao() {
    if (produtos.length === 0) {
        alert("Cadastre um produto primeiro.");
        return;
    }

    atualizarSelects();

    document.getElementById("dataProducao").value = dataHoje();

    document.getElementById("modalProducao").classList.remove("oculto");
}

function fecharModalProducao() {
    document.getElementById("modalProducao").classList.add("oculto");
}

function salvarProducao() {
    const produtoId = Number(
        document.getElementById("produtoProducao").value
    );

    const quantidade = Number(
        document.getElementById("quantidadeProducao").value
    );

    const data = document.getElementById("dataProducao").value;

    const status =
        document.getElementById("statusProducao").value;

    const produto = produtos.find(
        p => p.id === produtoId
    );

    if (!produto) {
        alert("Produto inválido.");
        return;
    }

    if (!quantidade || quantidade <= 0) {
        alert("Informe uma quantidade válida.");
        return;
    }

    if (!data) {
        alert("Informe a data.");
        return;
    }

    const producao = {
        id: Date.now(),
        produtoId,
        produto: produto.nome,
        quantidade,
        data,
        status,
        estoqueAdicionado: status === "Concluída",
        usuario: usuarioAtual,
        dataRegistro: novaDataHora()
    };

    if (status === "Concluída") {
        produto.estoque += quantidade;
    }

    producoes.push(producao);

    salvarDados();

    registrarHistorico(
        `Produção de ${quantidade} unidade(s) de "${produto.nome}" registrada com status "${status}"`
    );

    document.getElementById("quantidadeProducao").value = "";

    fecharModalProducao();

    atualizarTudo();
}

function alterarStatus(id) {
    const producao = producoes.find(
        p => p.id === id
    );

    if (!producao) {
        return;
    }

    const produto = produtos.find(
        p => p.id === producao.produtoId
    );

    if (!produto) {
        return;
    }

    if (producao.status === "Planejada") {
        producao.status = "Em produção";

        registrarHistorico(
            `Produção de "${produto.nome}" alterada para "Em produção"`
        );
    } else if (producao.status === "Em produção") {
        producao.status = "Concluída";

        if (!producao.estoqueAdicionado) {
            produto.estoque += producao.quantidade;
            producao.estoqueAdicionado = true;
        }

        registrarHistorico(
            `Produção de "${produto.nome}" concluída. ${producao.quantidade} unidade(s) adicionadas ao estoque`
        );
    } else {
        alert("Essa produção já foi concluída.");
        return;
    }

    producao.usuarioUltimaAlteracao = usuarioAtual;
    producao.dataUltimaAlteracao = novaDataHora();

    salvarDados();

    atualizarTudo();
}

function listarProducoes() {
    const lista = document.getElementById("listaProducoes");

    lista.innerHTML = "";

    if (producoes.length === 0) {
        lista.innerHTML =
            '<div class="sem-registros">Nenhuma produção registrada.</div>';

        return;
    }

    [...producoes].reverse().forEach(producao => {
        const item = document.createElement("div");

        item.className = "item";

        let classeStatus = "status-planejada";

        if (producao.status === "Em produção") {
            classeStatus = "status-producao";
        }

        if (producao.status === "Concluída") {
            classeStatus = "status-concluida";
        }

        let botao = "";

        if (producao.status !== "Concluída") {
            botao = `
                <button
                    class="principal"
                    onclick="alterarStatus(${producao.id})"
                >
                    Avançar status
                </button>
            `;
        }

        item.innerHTML = `
            <div>
                <h3>${producao.produto}</h3>

                <p>
                    Data:
                    ${formatarData(producao.data)}
                </p>

                <p>
                    Registrado por:
                    ${producao.usuario}
                </p>
            </div>

            <div>
                <p>Quantidade</p>

                <strong>
                    ${producao.quantidade}
                </strong>
            </div>

            <div>
                <span class="status ${classeStatus}">
                    ${producao.status}
                </span>

                <div class="acoes">
                    ${botao}
                </div>
            </div>
        `;

        lista.appendChild(item);
    });
}

function registrarHistorico(acao) {
    historico.push({
        id: Date.now() + Math.random(),
        usuario: usuarioAtual || "Sistema",
        acao,
        data: novaDataHora()
    });

    salvarDados();

    listarHistorico();
}

function listarHistorico() {
    const lista = document.getElementById("listaHistorico");

    lista.innerHTML = "";

    if (historico.length === 0) {
        lista.innerHTML =
            '<div class="sem-registros">Nenhuma ação registrada.</div>';

        return;
    }

    [...historico].reverse().forEach(registro => {
        const item = document.createElement("div");

        item.className = "item";

        item.innerHTML = `
            <div>
                <h3>${registro.acao}</h3>

                <p>
                    Usuário:
                    ${registro.usuario}
                </p>

                <p>
                    ${registro.data}
                </p>
            </div>
        `;

        lista.appendChild(item);
    });
}

function atualizarSelects() {
    const pedido = document.getElementById("produtoPedido");
    const producao = document.getElementById("produtoProducao");

    pedido.innerHTML = "";
    producao.innerHTML = "";

    produtos.forEach(produto => {
        pedido.innerHTML += `
            <option value="${produto.id}">
                ${produto.nome} - Estoque: ${produto.estoque}
            </option>
        `;

        producao.innerHTML += `
            <option value="${produto.id}">
                ${produto.nome}
            </option>
        `;
    });
}

function atualizarResumo() {
    document.getElementById("totalProdutos").textContent =
        produtos.length;

    const totalEstoque = produtos.reduce(
        (total, produto) => total + produto.estoque,
        0
    );

    document.getElementById("totalEstoque").textContent =
        totalEstoque;

    const baixos = produtos.filter(
        produto => produto.estoque <= produto.minimo
    );

    document.getElementById("estoqueBaixo").textContent =
        baixos.length;

    document.getElementById("totalPedidos").textContent =
        pedidos.length;

    const emProducao = producoes.filter(
        producao => producao.status === "Em produção"
    );

    document.getElementById("emProducao").textContent =
        emProducao.length;

    const concluidas = producoes.filter(
        producao => producao.status === "Concluída"
    );

    document.getElementById("producoesConcluidas").textContent =
        concluidas.length;
}

function listarAlertas() {
    const lista = document.getElementById("listaAlertas");

    lista.innerHTML = "";

    const produtosBaixos = produtos.filter(
        produto => produto.estoque <= produto.minimo
    );

    if (produtosBaixos.length === 0) {
        lista.innerHTML = `
            <div class="sem-registros">
                Nenhum produto com estoque baixo.
            </div>
        `;

        return;
    }

    produtosBaixos.forEach(produto => {
        const alerta = document.createElement("div");

        alerta.className = "alerta";

        alerta.innerHTML = `
            <strong>
                ⚠️ ${produto.nome}
            </strong>

            <p>
                Estoque atual:
                ${produto.estoque}
                |
                Estoque mínimo:
                ${produto.minimo}
            </p>
        `;

        lista.appendChild(alerta);
    });
}

function salvarDados() {
    localStorage.setItem(
        "produtosMDF",
        JSON.stringify(produtos)
    );

    localStorage.setItem(
        "pedidosMDF",
        JSON.stringify(pedidos)
    );

    localStorage.setItem(
        "producoesMDF",
        JSON.stringify(producoes)
    );

    localStorage.setItem(
        "historicoMDF",
        JSON.stringify(historico)
    );
}

function atualizarTudo() {
    listarProdutos();
    listarPedidos();
    listarProducoes();
    listarHistorico();
    listarAlertas();
    atualizarResumo();
    atualizarSelects();
}

function novaDataHora() {
    return new Date().toLocaleString("pt-BR");
}

function dataHoje() {
    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(
        hoje.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        hoje.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function formatarData(data) {
    if (!data) {
        return "";
    }

    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

if (usuarioAtual) {
    iniciarSistema();
}
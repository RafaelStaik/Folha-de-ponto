document.addEventListener('DOMContentLoaded', () => {
    // Pega o nome do usuário do sessionStorage
    const employeeName = sessionStorage.getItem('loggedInUserName');
    
    // Encontra o elemento com o ID 'employeeNameText' e insere o nome
    const nameElement = document.getElementById('employeeNameText');
    if (nameElement && employeeName) {
        nameElement.textContent = employeeName;
    }
    
    // Adiciona event listeners aos botões
    document.getElementById('calcularBtn').addEventListener('click', calcularFolha);
    document.getElementById('exportarPdfBtn').addEventListener('click', gerarOleritePDF);
    document.getElementById('voltarBtn').addEventListener('click', () => {
        window.location.href = 'folha_de_ponto.html';
    });
});

// Variáveis globais para armazenar os valores calculados
let dadosCalculados = {};

// Função para converter horas e minutos corretamente
function converterHoras(horasStr) {
    if (!horasStr || horasStr.trim() === '') {
        return 0;
    }
    const partes = horasStr.replace(',', '.').split('.');
    const horas = parseInt(partes[0]) || 0;
    let minutos = 0;
    if (partes.length > 1) {
        const minutosStr = partes[1];
        if (minutosStr.length === 1) {
            minutos = parseInt(minutosStr) * 10;
        } else {
            minutos = parseInt(minutosStr);
        }
    }
    return horas + (minutos / 60);
}

function calcularFolha() {
    const salarioBase = parseFloat(document.getElementById('salarioBase').value);
    const horas50Str = document.getElementById('horas50').value;
    const horas100Str = document.getElementById('horas100').value;
    const adicionalNoturnoStr = document.getElementById('adicionalNoturno').value;
    const mesSelecionado = parseInt(document.getElementById('mes').value);
    const anoSelecionado = parseInt(document.getElementById('ano').value);

    const adiantamento = salarioBase * 0.40;
    const valorHora = salarioBase / 220;
    const valorHoras50 = (valorHora * 1.5) * converterHoras(horas50Str);
    const valorHoras100 = (valorHora * 2) * converterHoras(horas100Str);
    const valorAdicionalNoturno = (valorHora * 0.2) * converterHoras(adicionalNoturnoStr);
    const valorVA = 10;
    const valorVT = 10;
    const valorCestaBasica = 150;

    const feriadosPorMes = [1, 0, 0, 2, 1, 1, 0, 0, 2, 2, 3, 2];
    const feriadosDoMes = feriadosPorMes[mesSelecionado];

    let domingosDoMes = 0;
    const dataInicial = new Date(anoSelecionado, mesSelecionado, 1);
    const dataFinal = new Date(anoSelecionado, mesSelecionado + 1, 0);

    for (let dia = dataInicial; dia <= dataFinal; dia.setDate(dia.getDate() + 1)) {
        if (dia.getDay() === 0) {
            domingosDoMes++;
        }
    }

    const diasNoMes = dataFinal.getDate();
    const diasUteis = diasNoMes - domingosDoMes - feriadosDoMes;
    const dsr = ((valorHoras50 + valorHoras100 + valorAdicionalNoturno) / diasUteis) * (domingosDoMes + feriadosDoMes);
    const valorBruto = salarioBase + valorHoras50 + valorHoras100 + valorAdicionalNoturno + dsr;

    function calcularINSS(salario) {
        let inss = 0;
        if (salario <= 1518.00) {
            inss = salario * 0.075;
        } else if (salario <= 2793.88) {
            const faixa1 = 1518.00 * 0.075;
            const faixa2 = (salario - 1518.00) * 0.09;
            inss = faixa1 + faixa2;
        } else if (salario <= 4190.83) {
            const faixa1 = 1518.00 * 0.075;
            const faixa2 = (2793.88 - 1518.00) * 0.09;
            const faixa3 = (salario - 2793.88) * 0.12;
            inss = faixa1 + faixa2 + faixa3;
        } else if (salario <= 8157.41) {
            const faixa1 = 1518.00 * 0.075;
            const faixa2 = (2793.88 - 1518.00) * 0.09;
            const faixa3 = (4190.83 - 2793.88) * 0.12;
            const faixa4 = (salario - 4190.83) * 0.14;
            inss = faixa1 + faixa2 + faixa3 + faixa4;
        } else {
            const faixa1 = 1518.00 * 0.075;
            const faixa2 = (2793.88 - 1518.00) * 0.09;
            const faixa3 = (4190.83 - 2793.88) * 0.12;
            const faixa4 = (8157.41 - 4190.83) * 0.14;
            inss = faixa1 + faixa2 + faixa3 + faixa4;
        }
        return inss;
    }
    const valorINSS = calcularINSS(valorBruto);
    const valorFGTS = valorBruto * 0.08;
    const salarioLiquido = valorBruto - valorINSS - valorVA - valorVT - adiantamento;
    const salarioLiquidoComCesta = salarioLiquido + valorCestaBasica;

    dadosCalculados = {
        salarioBase: salarioBase,
        horas50: converterHoras(horas50Str),
        valorHoras50: valorHoras50,
        horas100: converterHoras(horas100Str),
        valorHoras100: valorHoras100,
        adicionalNoturnoHoras: converterHoras(adicionalNoturnoStr),
        valorAdicionalNoturno: valorAdicionalNoturno,
        dsr: dsr,
        valorBruto: valorBruto,
        valorINSS: valorINSS,
        valorFGTS: valorFGTS,
        adiantamento: adiantamento,
        valorVT: valorVT,
        valorVA: valorVA,
        salarioLiquido: salarioLiquido,
        salarioLiquidoComCesta: salarioLiquidoComCesta,
        mes: mesSelecionado,
        ano: anoSelecionado,
        diasNoMes: diasNoMes,
    };
    document.getElementById('valorSalarioBase').textContent = `R$ ${salarioBase.toFixed(2).replace('.', ',')}`;
    document.getElementById('valorHoras50').textContent = `R$ ${valorHoras50.toFixed(2).replace('.', ',')}`;
    document.getElementById('valorHoras100').textContent = `R$ ${valorHoras100.toFixed(2).replace('.', ',')}`;
    document.getElementById('valorAdicionalNoturno').textContent = `R$ ${valorAdicionalNoturno.toFixed(2).replace('.', ',')}`;
    document.getElementById('valorDSR').textContent = `R$ ${dsr.toFixed(2).replace('.', ',')}`;
    document.getElementById('valorBruto').textContent = `R$ ${valorBruto.toFixed(2).replace('.', ',')}`;
    document.getElementById('valorFGTS').textContent = `R$ ${valorFGTS.toFixed(2).replace('.', ',')}`;
    document.getElementById('valorINSS').textContent = `R$ ${valorINSS.toFixed(2).replace('.', ',')}`;
    document.getElementById('valorVA').textContent = `R$ ${valorVA.toFixed(2).replace('.', ',')}`;
    document.getElementById('valorVT').textContent = `R$ ${valorVT.toFixed(2).replace('.', ',')}`;
    document.getElementById('valorAdiantamento').textContent = `R$ ${adiantamento.toFixed(2).replace('.', ',')}`;
    document.getElementById('valorLiquido').textContent = `R$ ${salarioLiquido.toFixed(2).replace('.', ',')}`;
    document.getElementById('valorLiquidoCestaBasica').textContent = `R$ ${salarioLiquidoComCesta.toFixed(2).replace('.', ',')}`;
}

// Função para gerar o Olerite em PDF
function gerarOleritePDF() {
    if (!dadosCalculados.salarioBase && dadosCalculados.salarioBase !== 0) {
        alert("Por favor, calcule a folha de pagamento antes de exportar o PDF.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const paddingX = 13;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 10;
    const lineHeight = 5;
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    // --- CABEÇALHO COM A ESTRUTURA ALINHADA ---
    doc.setFontSize(10);
    // Linha 1
    doc.text("TARGET SERVICOS PRESTADOS A EMPRESAS LTDA", paddingX, y);
    doc.text("Demonstrativo de pagamento de salário", pageWidth - paddingX, y, { align: 'right' });
    // Linha 2
    y += lineHeight;
    doc.text("AVENIDA DO FUTURO, 535 SALA 1", paddingX, y);
    // Linha 3
    y += lineHeight;
    doc.text(`01/${String(dadosCalculados.mes + 1).padStart(2,'0')}/${dadosCalculados.ano} a ${dadosCalculados.diasNoMes}/${String(dadosCalculados.mes + 1).padStart(2,'0')}/${dadosCalculados.ano}`, paddingX, y);
    doc.text("ADMINISTRACAO", pageWidth - paddingX, y, { align: 'right' });
    
    // Espaço para a tabela
    y += lineHeight * 1;

    // --- TABELA PRINCIPAL ---
    const totalVencimentos = dadosCalculados.salarioBase + dadosCalculados.valorHoras50 + dadosCalculados.valorHoras100 + dadosCalculados.dsr + dadosCalculados.valorAdicionalNoturno;
    const totalDescontos = dadosCalculados.valorVT + dadosCalculados.adiantamento + dadosCalculados.valorVA + dadosCalculados.valorINSS;
    
    const tableHeaders = ["Cód.", "Descrição", "Referência", "Vencimentos", "Descontos"];
    
    const tableBody = [
        ["001", "Salário Base", "220:00", `R$ ${dadosCalculados.salarioBase.toFixed(2).replace('.', ',')}`, ""],
        ["401", "Hora Extra c/ 50%", `${dadosCalculados.horas50.toFixed(2).replace('.', ':')}`, `R$ ${dadosCalculados.valorHoras50.toFixed(2).replace('.', ',')}`, ""],
        ["402", "Hora Extra c/ 100%", `${dadosCalculados.horas100.toFixed(2).replace('.', ':')}`, `R$ ${dadosCalculados.valorHoras100.toFixed(2).replace('.', ',')}`, ""],
        ["420", "Repouso Remunerado", "", `R$ ${dadosCalculados.dsr.toFixed(2).replace('.', ',')}`, ""],
        ["406", "Adicional Noturno", `${dadosCalculados.adicionalNoturnoHoras.toFixed(2).replace('.', ':')}`, `R$ ${dadosCalculados.valorAdicionalNoturno.toFixed(2).replace('.', ',')}`, ""],
        ["069", "Vale Transporte", "", "", `R$ ${dadosCalculados.valorVT.toFixed(2).replace('.', ',')}`],
        ["606", "Adiantamento", "", "", `R$ ${dadosCalculados.adiantamento.toFixed(2).replace('.', ',')}`],
        ["611", "Vale Refeição", "", "", `R$ ${dadosCalculados.valorVA.toFixed(2).replace('.', ',')}`],
        ["903", "INSS Folha", "", "", `R$ ${dadosCalculados.valorINSS.toFixed(2).replace('.', ',')}`],
        // Linhas de totais
        [{ content: " ", rowSpan: 2, colSpan: 3, styles: { fillColor: [255, 255, 255] } }, `R$ ${totalVencimentos.toFixed(2).replace('.', ',')}`, `R$ ${totalDescontos.toFixed(2).replace('.', ',')}`],
        [{ content: "Valor Líquido", styles: { halign: 'right' } }, `R$ ${dadosCalculados.salarioLiquido.toFixed(2).replace('.', ',')}`]
    ];
    
    doc.autoTable({
        startY: y,
        head: [tableHeaders],
        body: tableBody,
        theme: 'grid',
        headStyles: {
            fillColor: [52, 152, 219],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 9
        },
        bodyStyles: {
            fontSize: 8
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 70 },
            2: { cellWidth: 30, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' },
            4: { cellWidth: 35, halign: 'right' },
        },
        margin: { left: paddingX, right: paddingX },
        didDrawCell: function(data) {
            // Estilo para as linhas de totais e valor líquido
            if (data.section === 'body' && (data.row.index === tableBody.length - 2 || data.row.index === tableBody.length - 1)) {
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
            }
        }
    });

    // ESPAÇAMENTO DA TABELA PARA O RODAPÉ
    let finalY = doc.lastAutoTable.finalY || y;
    finalY += 5;

    // --- FUNÇÃO PARA DESENHAR ITENS CENTRALIZADOS EM RETÂNGULOS ---
    function desenharItemEmRetangulo(doc, titulo, valor, x, y, larguraColuna, alturaColuna) {
        const valorFormatado = `R$ ${valor.toFixed(2).replace('.', ',')}`;

        // Calcula larguras dos textos
        const larguraTitulo = doc.getTextWidth(titulo);
        const larguraValor = doc.getTextWidth(valorFormatado);

        // Centraliza horizontalmente dentro do retângulo
        const xTitulo = x + (larguraColuna - larguraTitulo) / 2;
        const xValor = x + (larguraColuna - larguraValor) / 2;

        // Centraliza verticalmente com espaçamento entre título e valor
        const yTitulo = y + alturaColuna / 2 - 2.5; // título um pouco acima do centro
        const yValor = y + alturaColuna / 2 + 2.5; // valor um pouco abaixo do centro
        
        doc.text(titulo, xTitulo, yTitulo);
        doc.text(valorFormatado, xValor, yValor);
    }
    
    // --- RODAPÉ COM A NOVA LÓGICA DE RETÂNGULOS ---
    doc.setFontSize(8);
    const dadosRodape = [
        { titulo: "SALDO BASE", valor: dadosCalculados.salarioBase },
        { titulo: "SAL. CONTRIB. INSS", valor: dadosCalculados.valorBruto },
        { titulo: "BASE CÁLC. FGTS", valor: dadosCalculados.valorBruto },
        { titulo: "F.G.T.S. DO MÊS", valor: dadosCalculados.valorFGTS },
        { titulo: "BASE CÁLC. IRRF", valor: 0.00 }
    ];

    const margemEsquerda = 2;
    const margemDireita = 4;
    const larguraPagina = doc.internal.pageSize.getWidth();
    const larguraUtil = larguraPagina - margemEsquerda - margemDireita;
    const numColunas = dadosRodape.length;
    const larguraColuna = larguraUtil / numColunas;
    const alturaColuna = 10; // Altura imaginária do bloco
    
    let x = margemEsquerda;
    dadosRodape.forEach((item) => {
        desenharItemEmRetangulo(doc, item.titulo, item.valor, x, finalY, larguraColuna, alturaColuna);
        x += larguraColuna;
    });

    finalY += alturaColuna + 5; // Adiciona um pequeno espaçamento após o último item

    doc.text("DECLARO TER RECEBIDO A IMPORTÂNCIA LÍQUIDA DISCRIMINADA NESTE RECIBO", paddingX, finalY);
    doc.line(paddingX + 25, finalY + 15, paddingX + 85, finalY + 15);
    doc.text("ASSINATURA DO FUNCIONÁRIO", paddingX + 35, finalY + 20);

    doc.save(`Olerite_${meses[dadosCalculados.mes]}_${dadosCalculados.ano}.pdf`);
}
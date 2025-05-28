function gerarCartao() {
    const nome = document.getElementById('nome').value.trim().toUpperCase();
    const especie = document.getElementById('especie').value.trim().toUpperCase();
    const sexo = document.getElementById('sexo').value.toUpperCase();
    const anilha = document.getElementById('anilha').value.trim().toUpperCase();
    const ctf = document.getElementById('ctf').value.trim().toUpperCase();
    const criador = document.getElementById('criador').value.trim().toUpperCase();
    const imagemInput = document.getElementById('imagem');

    if (!nome || !especie || !sexo || !anilha || !ctf || !criador) {
        alert("Por favor, preencha todos os campos do formulário!");
        return;
    }

    if (imagemInput.files.length === 0) {
        alert("Selecione uma imagem para o pássaro!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('bgImagem').src = e.target.result;
        document.getElementById('cardNome').textContent = nome;
        document.getElementById('cardEspecie').textContent = especie;
        document.getElementById('cardSexo').textContent = sexo;
        document.getElementById('cardAnilha').textContent = anilha;
        document.getElementById('cardCTF').textContent = ctf;
        document.getElementById('cardCriador').textContent = criador;

        document.getElementById('preview').style.display = 'flex';
        document.getElementById('color-selector').style.display = 'block';
    };

    reader.onerror = function (e) {
        console.error("Erro ao ler a imagem:", e);
        alert("Houve um erro ao carregar a imagem. Tente novamente.");
    };

    reader.readAsDataURL(imagemInput.files[0]);
}

function gerarPDF() {
    const previewElement = document.getElementById('preview');

    if (previewElement.style.display === 'none') {
        alert("Por favor, clique em 'Ver Cartão' antes de gerar o PDF.");
        return;
    }

    const pdfButton = document.querySelector('.botoes button:last-child');
    const originalButtonText = pdfButton.textContent;
    pdfButton.textContent = 'Gerando PDF...';
    pdfButton.disabled = true;

    // 1. Pega a cor de fundo ATUAL do cartão para usar no PDF
    const computedStyle = window.getComputedStyle(previewElement);
    const backgroundColor = computedStyle.backgroundColor;

    const options = {
        scale: 3, // Aumenta a escala para uma qualidade de imagem superior no PDF
        useCORS: true,
        allowTaint: true,
        backgroundColor: backgroundColor, // Usa a cor selecionada pelo usuário

        // 2. A MUDANÇA PRINCIPAL: Injetar os estilos do CSS no elemento clonado
        onclone: (clonedDoc) => {
            // Pega a tag <link> do seu style.css do documento principal
            const styleLink = document.querySelector('link[rel="stylesheet"]');
            if (styleLink) {
                // E a injeta no <head> do documento que será renderizado pelo html2canvas
                clonedDoc.head.appendChild(styleLink.cloneNode(true));
            }
            // Garante que o elemento a ser clonado esteja visível e sem margens
            const clonedElement = clonedDoc.querySelector('#preview');
            clonedElement.style.display = 'flex';
            clonedElement.style.margin = '0';
        }
    };

    html2canvas(previewElement, options).then(canvas => {
        const imageUrl = canvas.toDataURL('image/png', 1.0);
        const img = new Image();
        img.src = imageUrl;

        img.onload = function () {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = 210;
            const pdfHeight = 297;
            
            // Dimensões do cartão de crédito padrão (85.6mm x 53.98mm)
            const cardWidth = 85.6;
            const cardHeight = 53.98;

            const x = (pdfWidth - cardWidth) / 2;
            const y = (pdfHeight - cardHeight) / 2;

            pdf.addImage(imageUrl, 'PNG', x, y, cardWidth, cardHeight);
            pdf.save('cartao-identificacao.pdf');

            pdfButton.textContent = originalButtonText;
            pdfButton.disabled = false;
        };

        img.onerror = function () {
            pdfButton.textContent = originalButtonText;
            pdfButton.disabled = false;
            alert("Ocorreu um erro ao gerar a imagem para o PDF. Tente novamente.");
        };
    }).catch(error => {
        console.error("Erro no html2canvas:", error);
        pdfButton.textContent = originalButtonText;
        pdfButton.disabled = false;
        alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
    });
}

// Alterar cor do cartão
document.addEventListener('DOMContentLoaded', () => {
    const colorCircles = document.querySelectorAll('.color-circle');
    const cardPreview = document.getElementById('preview');

    colorCircles.forEach(circle => {
        circle.addEventListener('click', () => {
            const color = circle.dataset.color;
            cardPreview.style.backgroundColor = color;
        });
    });
});
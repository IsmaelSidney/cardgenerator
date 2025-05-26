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

    const bgImagem = document.getElementById('bgImagem');
    if (!bgImagem.complete || !bgImagem.naturalHeight) {
        alert("Aguarde a imagem carregar completamente antes de gerar o PDF.");
        return;
    }

    const pdfButton = document.querySelector('.botoes button:last-child');
    const originalButtonText = pdfButton.textContent;
    pdfButton.textContent = 'Gerando PDF...';
    pdfButton.disabled = true;

    // Forçar a exibição do preview
    previewElement.style.display = 'flex';

    // Configurações do html2canvas
    const options = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffa500',
        width: 650,
        height: 425,
        onclone: function (clonedDoc) {
            const clonedElement = clonedDoc.querySelector('#preview');
            clonedElement.style.display = 'flex';
            clonedElement.style.position = 'relative';
            clonedElement.style.width = '650px';
            clonedElement.style.height = '425px';

            const imgCircular = clonedElement.querySelector('.imagem-circular');
            if (imgCircular) {
                imgCircular.style.width = '200px';
                imgCircular.style.height = '200px';
                imgCircular.style.borderRadius = '50%';
                imgCircular.style.overflow = 'hidden';
                imgCircular.style.border = '5px solid #fff';
            }

            const campos = clonedElement.querySelectorAll('.campo');
            campos.forEach(campo => {
                campo.style.backgroundColor = 'white';
                campo.style.padding = '6px 12px';
                campo.style.borderRadius = '8px';
                campo.style.border = '1px solid #ddd';
            });
        }
    };

    // Primeiro gera a imagem do cartão
    html2canvas(previewElement, options).then(canvas => {
        // Converte o canvas para uma URL de dados
        const imageUrl = canvas.toDataURL('image/png', 1.0);

        // Cria uma imagem para garantir que está carregada
        const img = new Image();
        img.src = imageUrl;

        img.onload = function () {
            // Cria um novo PDF no formato A4 retrato
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // Dimensões do PDF A4 retrato em mm
            const pdfWidth = 210;  // A4 retrato largura
            const pdfHeight = 297; // A4 retrato altura

            // Dimensões desejadas do cartão em mm (reduzidas em 20%)
            const cardWidth = 104;  // 13cm * 0.8 = 10.4cm
            const cardHeight = 68;  // 8.5cm * 0.8 = 6.8cm

            // Calcula a posição para centralizar o cartão na página
            const x = (pdfWidth - cardWidth) / 2;
            const y = (pdfHeight - cardHeight) / 2;

            // Adiciona a imagem ao PDF com as dimensões reduzidas
            pdf.addImage(imageUrl, 'PNG', x, y, cardWidth, cardHeight);

            // Salva o PDF
            pdf.save('cartao-identificacao.pdf');

            // Restaura o botão
            pdfButton.textContent = originalButtonText;
            pdfButton.disabled = false;
        };

        img.onerror = function () {
            console.error("Erro ao carregar a imagem para o PDF");
            pdfButton.textContent = originalButtonText;
            pdfButton.disabled = false;
            alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
        };
    }).catch(error => {
        console.error("Erro ao gerar PDF:", error);
        pdfButton.textContent = originalButtonText;
        pdfButton.disabled = false;
        alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
    });
}
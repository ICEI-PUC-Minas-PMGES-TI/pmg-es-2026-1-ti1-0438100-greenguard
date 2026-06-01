const ratingRows      = document.querySelectorAll(".rating-row");
const sentimentButtons = document.querySelectorAll(".sentiment-btn");
const sendButton       = document.getElementById("enviarBtn");
const commentInput     = document.getElementById("comentario");

const feedbackData = {
    comentario: "",
    sentimento: "positivo",
    classificacao: {
        seguranca:    0,
        iluminacao:   0,
        movimentacao: 0
    }
};

/* ── Renderiza estrelas preenchidas até o valor escolhido ── */
function renderStars(container, value) {
    container.querySelectorAll(".star").forEach((star) => {
        const v = Number(star.dataset.value);
        star.classList.toggle("filled", v <= value);
        star.setAttribute("aria-checked", String(v === value));
    });
}

/* ── Cria as 5 estrelas de cada linha de avaliação ── */
function setupRatings() {
    ratingRows.forEach((row) => {
        const key            = row.dataset.ratingKey;
        const starsContainer = row.querySelector(".stars");

        for (let i = 1; i <= 5; i++) {
            const btn = document.createElement("button");
            btn.type      = "button";
            btn.className = "star";
            btn.dataset.value = String(i);
            btn.setAttribute("role", "radio");
            btn.setAttribute("aria-label", `${i} estrela${i > 1 ? "s" : ""}`);
            btn.innerHTML = "&#9733;";

            btn.addEventListener("click", () => {
                feedbackData.classificacao[key] = i;
                renderStars(starsContainer, i);
            });

            starsContainer.appendChild(btn);
        }

        renderStars(starsContainer, feedbackData.classificacao[key]);
    });
}

/* ── Alterna seleção dos botões Positivo / Negativo ── */
function setupSentimentToggle() {
    sentimentButtons.forEach((button) => {
        button.addEventListener("click", () => {
            feedbackData.sentimento = button.dataset.sentiment;

            sentimentButtons.forEach((btn) => {
                const isSelected = btn === button;
                btn.classList.toggle("selected",     isSelected);
                btn.classList.toggle("not-selected", !isSelected);
            });
        });
    });
}

/* ── Coleta dados e exibe resultado ── */
function handleSend() {
    feedbackData.comentario = commentInput.value.trim();

    const payload = {
        comentario:       feedbackData.comentario,
        feedback:         feedbackData.sentimento,
        classificacaoGeral: { ...feedbackData.classificacao }
    };

    console.log("Dados do feedback:", payload);

    alert(
        "Feedback enviado!\n\n" +
        `Tipo: ${payload.feedback}\n` +
        `Segurança: ${payload.classificacaoGeral.seguranca}/5\n` +
        `Iluminação: ${payload.classificacaoGeral.iluminacao}/5\n` +
        `Movimentação: ${payload.classificacaoGeral.movimentacao}/5`
    );
}

/* ── Inicialização ── */
setupRatings();
setupSentimentToggle();
sendButton.addEventListener("click", handleSend);

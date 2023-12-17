const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "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";
const initialHeight = chatInput.scrollHeight;

const loadDataFromLocalstorage = () => {
    const themeColor = localStorage.getItem("theme-color");
    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    localStorage.setItem("theme-color", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
    const defaultText = `<div class= "default-text">
    <img src="images/chatgbtbg.jpg" alt="bg-images" style="background-size: cover; height: 760px; width:100%"/>
    <p></p> </div>`;
    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
};
loadDataFromLocalstorage();


const createElement = (html, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv;
};

const getChatResponse = async (incomingChatDiv) => {
    // https://platform.openai.com/docs/api-reference/edits
    const API_URL = "https://api.openai.com/v1/completions";
    const pElement = document.createElement("p");

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: userText,
            max_tokens: 2048,
            temperature: 0.2,
            n: 1,
            stop: null,
        }),
    };
    // API yanıtına post isteği gönderin ve yanıtı paragraf  metni olarak ayarlayın

    try {
        const response = await (await fetch(API_URL, requestOptions)).json();
        pElement.textContent = response.choices[0].text.trim();
    } catch (error) {
        pElement.classList.add("error");
        pElement.textContent = "ooooops";
    }


    // yazım animasyonunu kaldırın paragraf öğesini ekleyin ve sohbetleri yerel depolama alanına kaydedin
    incomingChatDiv.querySelector(".typing-animation").remove(),
        incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
};

const copyResponse = (copyBtn) => {
    // yanıtın metin içeriğini panoya kopyalama
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => (copyBtn.textContent = "content_copy"), 1000);

};

const showTypingAnimation = () => {
    const html = `<div class="chat-content">
    <div class="chat-details">
    <img src="images/chatbot.jpg" alt="user-images" />
    <div class="typing-animation">
    <div class="typing-dot" style="--delay: 0.2s"></div>
    <div class="typing-dot" style="--delay: 0.3s"></div>
    <div class="typing-dot" style="--delay: 0.4s"></div>
    </div>
    </div>

    <span class="material-symbols-outlined"> content_copy </span>
    </div>`;


    //yazma animasyonu ile gelen bir div oluşturun ve bunu sohbet containarına ekleyin

    const incomingChatDiv = createElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);
};

const handleOutGoingChat = () => {
    userText = chatInput.value.trim();
    if (!userText) return;
    chatInput.value = '';
    chatInput.style.height = `${initialHeight}px`;
    const html = `<div class="chat-content">
    <div class="chat-details">
    <img src="images/user.jpg" alt="user-images"/>
    <p>
    ${userText}
    </p>
    </div>
    </div>`;
    const outgoingChatDiv = createElement(html, "outgoing");
    outgoingChatDiv.querySelector("p").textContent = userText;
    document.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);


};

themeButton.addEventListener("click", () => {
    // tema modu için  sınıfını değiştir ve temayı localde tut

    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

});

deleteButton.addEventListener("click", () => {
    if (confirm("Tüm sohbetleri silmek istediğinizden emin misiniz?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

chatInput.addEventListener("input", () => {
    // textarea içindeki veriye göre yükseklik ayarı
    chatInput.style.height = `${initialHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;

});

chatInput.addEventListener("keydown", (e) => {
    //shift tuşu olmadan enter tuşuna basılırsa ve pencere genişliği 800 pikselden büyükse giden sohbeti işleyin
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutGoingChat();
    }
});

sendButton.addEventListener("click", handleOutGoingChat);


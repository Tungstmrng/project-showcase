
const gallery = document.getElementById("gallery");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

let currentIndex = 0;

function updateGallery() {

    const cards = gallery.querySelectorAll(".project-card");

    const cardWidth = cards[0].offsetWidth;
    const gap = 25;

    const visibleCards = window.innerWidth <= 600 ? 1 :
                         window.innerWidth <= 900 ? 2 : 3;

    const maxIndex = Math.max(0, cards.length - visibleCards);

    currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));

    gallery.style.transform =
        `translateX(-${currentIndex * (cardWidth + gap)}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === maxIndex;
}

nextBtn.addEventListener("click", () => {
    currentIndex++;
    updateGallery();
});

prevBtn.addEventListener("click", () => {
    currentIndex--;
    updateGallery();
});

window.addEventListener("resize", updateGallery);

updateGallery();

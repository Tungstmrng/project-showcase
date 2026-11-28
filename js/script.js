const gallery = document.getElementById("gallery");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

let currentIndex = 0;

function updateGallery() {
    if (!gallery || !nextBtn || !prevBtn) return;

    const cards = gallery.querySelectorAll(".project-card");

    if (cards.length === 0) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    const cardWidth = cards[0].offsetWidth;
    const gap = parseFloat(
        window.getComputedStyle(gallery).columnGap
    ) || 0;

    const visibleCards =
        window.innerWidth <= 600 ? 1 :
        window.innerWidth <= 900 ? 2 : 3;

    const maxIndex = Math.max(
        0,
        cards.length - visibleCards
    );

    currentIndex = Math.max(
        0,
        Math.min(currentIndex, maxIndex)
    );

    gallery.style.transform =
        `translateX(-${currentIndex * (cardWidth + gap)}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === maxIndex;
}

// Only initialize navigation on pages with a gallery
if (gallery && nextBtn && prevBtn) {
    nextBtn.addEventListener("click", () => {
        currentIndex++;
        updateGallery();
    });

    prevBtn.addEventListener("click", () => {
        currentIndex--;
        updateGallery();
    });

    window.addEventListener("resize", updateGallery);

    // Update the gallery when Supabase adds project cards
    const observer = new MutationObserver(() => {
        updateGallery();
    });

    observer.observe(gallery, {
        childList: true
    });

    updateGallery();
}
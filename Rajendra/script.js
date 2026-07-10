function saveVCard() {
    const p = {
        name: "Rajendra Rathod",
        title: "Managing Partner",
        tel: "+91 70699 80600",
        email: "rajendra@rssrewinding.com"
    };
    const nameParts = p.name.split(" ");
    const family = nameParts.pop();
    const given = nameParts.join(" ");
    const vcf = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${family};${given};;;`,
        `FN:${p.name}`,
        "ORG:RSS - Rewinding Service Solution",
        `TITLE:${p.title}`,
        `TEL;TYPE=CELL,VOICE:${p.tel}`,
        `EMAIL;TYPE=INTERNET:${p.email}`,
        "URL:https://www.rssrewinding.com",
        "ADR;TYPE=WORK:;;Jay Ranchod Complex, Post - Manjusar, Taluka - Savli;Vadodara;Gujarat;391775;India",
        "END:VCARD"
    ].join("\r\n");

    const filename = p.name.replace(/\s+/g, "_") + ".vcf";
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid) {
        // Android: navigate straight to the vCard as text/x-vcard content
        // (no "download" attribute) so Chrome/Android hands it to the
        // Contacts app chooser directly instead of just saving a file
        // to Downloads.
        const dataUri = "data:text/x-vcard;charset=utf-8," + encodeURIComponent(vcf);
        window.location.href = dataUri;
    } else {
        // iOS / desktop: Blob download works reliably here — iOS Safari
        // shows the "Add to Contacts" preview when the .vcf is opened,
        // and desktop OSes import it via double-click.
        const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 3000);
    }
}

(function () {
    const wrap = document.getElementById("cardWrap");
    const card = document.getElementById("card");
    let flipped = false;
    let rafId = null;
    const isCoarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;

    function applyTilt(x, y, rect) {
        const px = (x - rect.left) / rect.width;
        const py = (y - rect.top) / rect.height;
        const rotY = (px - 0.5) * 12;
        const rotX = (0.5 - py) * 8;
        const baseFlip = flipped ? 180 : 0;
        card.style.transform = `rotateY(${baseFlip + (flipped ? -rotY : rotY)}deg) rotateX(${rotX}deg)`;
    }
    function resetTilt() {
        card.style.transform = `rotateY(${flipped ? 180 : 0}deg) rotateX(0deg)`;
    }
    if (!isCoarse) {
        wrap.addEventListener("mousemove", (e) => {
            const rect = wrap.getBoundingClientRect();
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => applyTilt(e.clientX, e.clientY, rect));
        });
        wrap.addEventListener("mouseleave", () => {
            card.classList.add("flipping");
            resetTilt();
            setTimeout(() => card.classList.remove("flipping"), 700);
        });
    }
    function doFlip() {
        flipped = !flipped;
        card.classList.add("flipping");
        card.style.transform = `rotateY(${flipped ? 180 : 0}deg) rotateX(0deg)`;
        wrap.setAttribute("aria-pressed", String(flipped));
        setTimeout(() => card.classList.remove("flipping"), 700);
    }
    wrap.addEventListener("click", doFlip);
    wrap.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            doFlip();
        }
    });
})();
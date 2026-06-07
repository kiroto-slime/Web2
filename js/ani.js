
        window.addEventListener("load", () => {
            setTimeout(() => {
                document.getElementById("loading").style.display = "none";
            }, 1500);
        });


        document.addEventListener("click", (e) => {

            for (let i = 0; i < 12; i++) {

                const star = document.createElement("div");

                star.innerHTML = "💻";
                star.style.position = "fixed";
                star.style.left = `${e.clientX}px`;
                star.style.top = `${e.clientY}px`;
                star.style.pointerEvents = "none";
                star.style.transition = "all 0.8s ease";

                document.body.appendChild(star);

                const angle = Math.random() * Math.PI * 2;
                const distance = 50 + Math.random() * 80;

                requestAnimationFrame(() => {
                    star.style.transform =
                        `translate(${Math.cos(angle) * distance}px,
                                ${Math.sin(angle) * distance}px)`;
                    star.style.opacity = "0";
                });

                setTimeout(() => star.remove(), 800);
            }
        });

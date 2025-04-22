// This file contains JavaScript code for interactive elements of the website, such as navigation and form handling for the booking system.

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            targetElement.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Booking form handling
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Here you can add form validation and submission logic
            alert('Booking submitted!'); // Placeholder for actual submission logic
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.querySelector(".carousel");
    const images = document.querySelectorAll(".carousel img");
    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");
    let index = 0;

    function updateCarousel() {
        carousel.style.transform = `translateX(-${index * 100}%)`;
    }

    function showNext() {
        index = (index + 1) % images.length;
        updateCarousel();
    }

    function showPrev() {
        index = (index - 1 + images.length) % images.length;
        updateCarousel();
    }

    nextBtn.addEventListener("click", showNext);
    prevBtn.addEventListener("click", showPrev);

    setInterval(showNext, 3000); // Auto-rotate every 3 seconds
});
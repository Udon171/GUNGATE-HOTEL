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
    const checkinInput = document.getElementById("checkin");
    const checkoutInput = document.getElementById("checkout");
    const roomTypeSelect = document.getElementById("room-type");
    const bookingForm = document.querySelector("form");

    // Fetch booked dates for the selected room
    async function fetchBookedDates(roomId) {
        try {
            const response = await fetch(`/booked_dates/${roomId}`);
            const data = await response.json();
            disableBookedDates(data.booked_dates);
        } catch (error) {
            console.error("Error fetching booked dates:", error);
        }
    }

    // Disable booked dates in the date picker
    function disableBookedDates(bookedDates) {
        const disabledDates = bookedDates.map(booking => ({
            start: new Date(booking.checkin),
            end: new Date(booking.checkout)
        }));

        checkinInput.addEventListener("input", () => {
            const checkinDate = new Date(checkinInput.value);
            checkoutInput.min = checkinInput.value;

            // Disable dates in the checkout input
            checkoutInput.addEventListener("input", () => {
                const checkoutDate = new Date(checkoutInput.value);
                disabledDates.forEach(({ start, end }) => {
                    if (checkinDate <= end && checkoutDate >= start) {
                        alert("Selected dates are unavailable. Please choose different dates.");
                        checkinInput.value = "";
                        checkoutInput.value = "";
                    }
                });
            });
        });
    }

    // Handle room type change
    roomTypeSelect.addEventListener("change", () => {
        const roomId = roomTypeSelect.value;
        if (roomId) {
            fetchBookedDates(roomId);
        }
    });

    // Submit booking form
    bookingForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent default form submission

        const formData = {
            checkin: document.getElementById("checkin").value,
            checkout: document.getElementById("checkout").value,
            room_id: document.getElementById("room-type").value,
            name: document.getElementById("name").value,
            email: document.getElementById("email").value
        };

        try {
            const response = await fetch("/book", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (response.ok) {
                // Redirect to confirmation page
                window.location.href = "confirmation.html";
            } else {
                alert(result.error || "An error occurred while booking.");
            }
        } catch (error) {
            console.error("Error submitting booking:", error);
            alert("An unexpected error occurred. Please try again.");
        }
    });
});

// This file contains JavaScript code for the image carousel functionality on the homepage.
// It allows users to navigate through images using next and previous buttons, and it also auto-rotates the images every few seconds. 
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